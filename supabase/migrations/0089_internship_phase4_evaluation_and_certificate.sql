-- Internship Management, Phase 4: final supervisor evaluation and a PDF
-- completion certificate. Continues §55-§57's roadmap. The exact official
-- evaluation form isn't finalized (per the original spec), so
-- internship_evaluations keeps the explicitly-listed fields as real columns
-- plus a `details jsonb` escape hatch, the same reasoning internship_reports
-- (0088) used for its flexible content field.

alter table internship_assignments add column completed_at timestamptz;

create table internship_evaluations (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references internship_assignments (id) on delete cascade,
  supervisor_profile_id uuid not null references profiles (id),
  completion_confirmed boolean not null,
  overall_performance text,
  attendance_note text,
  remarks text,
  recommendation text,
  final_status text not null check (final_status in ('successfully_completed', 'not_completed')),
  details jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger internship_evaluations_set_updated_at before update on internship_evaluations
  for each row execute function set_updated_at();

-- Atomic per-department, per-year sequence, structurally identical to
-- registration_counters (0005) -- no client access at all, only the RPC
-- below ever touches it.
create table internship_certificate_counters (
  department_id uuid not null references departments (id) on delete cascade,
  academic_year int not null,
  last_seq int not null default 0,
  primary key (department_id, academic_year)
);

create table internship_certificates (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references internship_assignments (id) on delete cascade,
  certificate_number text not null unique,
  generated_by uuid references profiles (id),
  generated_at timestamptz not null default now()
);

-- Business logic --------------------------------------------------------

create or replace function submit_internship_evaluation(
  p_assignment_id uuid,
  p_completion_confirmed boolean,
  p_overall_performance text,
  p_attendance_note text,
  p_remarks text,
  p_recommendation text,
  p_final_status text
)
returns internship_evaluations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
  v_evaluation internship_evaluations;
begin
  if current_user_role() <> 'faculty' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if p_final_status not in ('successfully_completed', 'not_completed') then
    raise exception 'invalid_final_status';
  end if;

  select * into v_assignment from internship_assignments where id = p_assignment_id for update;
  if not found then
    raise exception 'assignment_not_found';
  end if;
  if v_assignment.supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_assignment.status <> 'completion_pending' then
    raise exception 'invalid_status: assignment must be completion_pending, got %', v_assignment.status;
  end if;

  insert into internship_evaluations (
    assignment_id, supervisor_profile_id, completion_confirmed, overall_performance,
    attendance_note, remarks, recommendation, final_status
  )
  values (
    p_assignment_id, auth.uid(), p_completion_confirmed, p_overall_performance,
    p_attendance_note, p_remarks, p_recommendation, p_final_status
  )
  on conflict (assignment_id) do update set
    completion_confirmed = excluded.completion_confirmed,
    overall_performance = excluded.overall_performance,
    attendance_note = excluded.attendance_note,
    remarks = excluded.remarks,
    recommendation = excluded.recommendation,
    final_status = excluded.final_status,
    updated_at = now()
  returning * into v_evaluation;

  if p_completion_confirmed and p_final_status = 'successfully_completed' then
    update internship_assignments set status = 'completed', completed_at = now() where id = p_assignment_id;
  end if;

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    v_assignment.student_profile_id,
    'Internship evaluation submitted',
    case when p_completion_confirmed and p_final_status = 'successfully_completed'
      then 'Your supervisor has confirmed successful completion of your internship.'
      else 'Your supervisor has submitted your final evaluation.'
    end,
    'internship_assignments', v_assignment.id
  );

  return v_evaluation;
end;
$$;

create or replace function generate_internship_certificate(p_assignment_id uuid)
returns internship_certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
  v_evaluation internship_evaluations;
  v_existing internship_certificates;
  v_dept_code text;
  v_year int;
  v_seq int;
  v_certificate internship_certificates;
begin
  select * into v_assignment from internship_assignments where id = p_assignment_id for update;
  if not found then
    raise exception 'assignment_not_found';
  end if;

  if current_user_role() = 'student' and v_assignment.student_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if current_user_role() not in ('student', 'admin')
     and not (current_user_role() = 'department' and v_assignment.department_id = current_department_id())
     and not is_departmental_internship_focal(v_assignment.department_id)
     and not is_central_internship_focal() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if v_assignment.status <> 'completed' then
    raise exception 'invalid_status: assignment must be completed, got %', v_assignment.status;
  end if;
  select * into v_evaluation from internship_evaluations where assignment_id = p_assignment_id;
  if not found or not v_evaluation.completion_confirmed or v_evaluation.final_status <> 'successfully_completed' then
    raise exception 'completion_not_confirmed';
  end if;

  select * into v_existing from internship_certificates where assignment_id = p_assignment_id;
  if found then
    return v_existing;
  end if;

  select code into v_dept_code from departments where id = v_assignment.department_id;
  v_year := extract(year from now())::int;

  insert into internship_certificate_counters (department_id, academic_year, last_seq)
  values (v_assignment.department_id, v_year, 1)
  on conflict (department_id, academic_year)
  do update set last_seq = internship_certificate_counters.last_seq + 1
  returning last_seq into v_seq;

  insert into internship_certificates (assignment_id, certificate_number, generated_by)
  values (p_assignment_id, 'INT-' || v_year || '-' || upper(v_dept_code) || '-' || lpad(v_seq::text, 3, '0'), auth.uid())
  returning * into v_certificate;

  return v_certificate;
end;
$$;

-- RLS ---------------------------------------------------------------------

alter table internship_evaluations enable row level security;
alter table internship_certificate_counters enable row level security;
alter table internship_certificates enable row level security;

create policy "internship_evaluations_select_scoped" on internship_evaluations
  for select to authenticated
  using (
    exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

create policy "internship_certificate_counters_no_client_access" on internship_certificate_counters
  for all to authenticated
  using (false)
  with check (false);

create policy "internship_certificates_select_scoped" on internship_certificates
  for select to authenticated
  using (
    exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );
