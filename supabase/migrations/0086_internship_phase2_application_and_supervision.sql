-- Internship Management, Phase 2: student application + academic
-- supervisor selection/approval. Closely modeled on the FYP supervision
-- workflow (create_fyp_group()/respond_to_fyp_supervision(), 0007/0048) —
-- the closest existing precedent for student<->supervisor matching with
-- capacity limits. One deliberate divergence: a supervisor rejection here
-- is appended as a new internship_supervisor_requests row rather than reset
-- in place on the parent record, since the spec explicitly requires the
-- rejected request to survive in history rather than be overwritten.

create type internship_assignment_status as enum (
  'supervisor_pending', 'supervisor_rejected', 'assigned', 'in_progress',
  'completion_pending', 'completed', 'cancelled'
);

-- Current state of one student's internship attempt for one config cycle.
-- Company/supervisor can each be resubmitted after a supervisor rejection
-- (the row is mutated in place, matching fyp_groups' own shape) — it's the
-- request history below that's append-only, not this row.
create table internship_assignments (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references profiles (id) on delete cascade,
  config_id uuid not null references internship_configs (id) on delete cascade,
  department_id uuid not null references departments (id), -- denormalized from config, mirrors internship_mous' own department_id
  company_id uuid not null references internship_companies (id),
  mou_id uuid not null references internship_mous (id),     -- the specific MoU active at application time (snapshot)
  supervisor_profile_id uuid references profiles (id),
  status internship_assignment_status not null default 'supervisor_pending',
  duration_weeks int not null,
  start_date date,
  end_date date,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, config_id)
);
create index internship_assignments_student_idx on internship_assignments (student_profile_id);
create index internship_assignments_supervisor_idx on internship_assignments (supervisor_profile_id);
create index internship_assignments_config_idx on internship_assignments (config_id);
create index internship_assignments_department_idx on internship_assignments (department_id);
create trigger internship_assignments_set_updated_at before update on internship_assignments
  for each row execute function set_updated_at();

-- Append-only: one row per request cycle. A rejection followed by
-- resubmission creates a NEW row (never overwrites the rejected one) so the
-- full history of who was asked and why they declined survives.
create table internship_supervisor_requests (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references internship_assignments (id) on delete cascade,
  supervisor_profile_id uuid not null references profiles (id),
  status text not null default 'pending' check (status in ('pending', 'agreed', 'disagreed')),
  reason text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  responded_by uuid references profiles (id)
);
create index internship_supervisor_requests_assignment_idx on internship_supervisor_requests (assignment_id);
create index internship_supervisor_requests_supervisor_idx on internship_supervisor_requests (supervisor_profile_id);

-- Optional per-teacher cap. Absent row = unlimited. "Current load" counts
-- pending requests too (not just confirmed assignments), matching the
-- spec's stated preference for preventing over-selection outright rather
-- than letting the supervisor reject for capacity reasons.
create table internship_supervisor_capacity (
  profile_id uuid primary key references profiles (id) on delete cascade,
  capacity int not null check (capacity > 0),
  set_by uuid references profiles (id),
  updated_at timestamptz not null default now()
);

-- Business logic --------------------------------------------------------

create or replace function apply_for_internship(
  p_config_id uuid,
  p_company_id uuid,
  p_supervisor_profile_id uuid
)
returns internship_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config internship_configs;
  v_student profiles;
  v_company internship_companies;
  v_mou internship_mous;
  v_supervisor profiles;
  v_assignment internship_assignments;
  v_capacity int;
  v_current_load int;
begin
  if current_user_role() <> 'student' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_student from profiles where id = auth.uid();

  select * into v_config from internship_configs where id = p_config_id;
  if not found then
    raise exception 'config_not_found';
  end if;
  if not v_config.is_enabled then
    raise exception 'internship_not_enabled';
  end if;
  if v_config.application_open_date is not null and current_date < v_config.application_open_date then
    raise exception 'application_window_not_open';
  end if;
  if v_config.application_close_date is not null and current_date > v_config.application_close_date then
    raise exception 'application_window_closed';
  end if;

  if v_student.department_id <> v_config.department_id
     or v_student.program_id is distinct from v_config.program_id
     or v_student.current_semester_id is distinct from v_config.semester_id then
    raise exception 'not_eligible_for_this_internship_cycle';
  end if;

  select * into v_company from internship_companies
    where id = p_company_id and department_id = v_config.department_id and is_active;
  if not found then
    raise exception 'company_not_available';
  end if;

  select * into v_mou from internship_mous
    where company_id = p_company_id and mou_effective_status(status, mou_expiry_date) = 'active'
    order by mou_expiry_date desc
    limit 1;
  if not found then
    raise exception 'company_has_no_active_mou';
  end if;

  select * into v_supervisor from profiles where id = p_supervisor_profile_id and role = 'faculty';
  if not found then
    raise exception 'invalid_supervisor: must be a faculty member';
  end if;
  if not v_config.allow_cross_department_supervisor and v_supervisor.department_id <> v_config.department_id then
    raise exception 'invalid_supervisor: must be a faculty member in this department';
  end if;

  select capacity into v_capacity from internship_supervisor_capacity where profile_id = p_supervisor_profile_id;
  if v_capacity is not null then
    select count(*) into v_current_load from internship_assignments
      where supervisor_profile_id = p_supervisor_profile_id
        and status in ('supervisor_pending', 'assigned', 'in_progress');
    if v_current_load >= v_capacity then
      raise exception 'supervisor_capacity_exceeded';
    end if;
  end if;

  select * into v_assignment from internship_assignments
    where student_profile_id = auth.uid() and config_id = p_config_id for update;

  if found then
    if v_assignment.status <> 'supervisor_rejected' then
      raise exception 'application_already_in_progress: status is %', v_assignment.status;
    end if;
    update internship_assignments
    set company_id = p_company_id, mou_id = v_mou.id, status = 'supervisor_pending', supervisor_profile_id = null
    where id = v_assignment.id
    returning * into v_assignment;
  else
    insert into internship_assignments (student_profile_id, config_id, department_id, company_id, mou_id, duration_weeks, status)
    values (auth.uid(), p_config_id, v_config.department_id, p_company_id, v_mou.id, v_config.duration_weeks, 'supervisor_pending')
    returning * into v_assignment;
  end if;

  insert into internship_supervisor_requests (assignment_id, supervisor_profile_id)
  values (v_assignment.id, p_supervisor_profile_id);

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    p_supervisor_profile_id,
    'New internship supervision request',
    coalesce(v_student.full_name, 'A student') || ' requested you as their internship supervisor (' || v_company.name || ')',
    'internship_assignments', v_assignment.id
  );

  return v_assignment;
end;
$$;

create or replace function respond_to_internship_supervision(
  p_request_id uuid,
  p_approve boolean,
  p_reason text default null
)
returns internship_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request internship_supervisor_requests;
  v_assignment internship_assignments;
  v_config internship_configs;
begin
  if current_user_role() <> 'faculty' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_request from internship_supervisor_requests where id = p_request_id for update;
  if not found then
    raise exception 'request_not_found';
  end if;
  if v_request.supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'invalid_status: request must be pending, got %', v_request.status;
  end if;
  if not p_approve and (p_reason is null or trim(p_reason) = '') then
    raise exception 'reason_required';
  end if;

  select * into v_assignment from internship_assignments where id = v_request.assignment_id for update;
  if v_assignment.status <> 'supervisor_pending' then
    raise exception 'invalid_status: assignment must be supervisor_pending, got %', v_assignment.status;
  end if;

  update internship_supervisor_requests
  set status = case when p_approve then 'agreed' else 'disagreed' end,
      reason = case when p_approve then null else p_reason end,
      responded_at = now(),
      responded_by = auth.uid()
  where id = p_request_id;

  if p_approve then
    select * into v_config from internship_configs where id = v_assignment.config_id;
    update internship_assignments
    set status = 'assigned', supervisor_profile_id = auth.uid(),
        start_date = v_config.internship_start_date, end_date = v_config.internship_end_date,
        assigned_at = now()
    where id = v_assignment.id
    returning * into v_assignment;
  else
    update internship_assignments
    set status = 'supervisor_rejected', supervisor_profile_id = null
    where id = v_assignment.id
    returning * into v_assignment;
  end if;

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    v_assignment.student_profile_id,
    case when p_approve then 'Internship supervisor approved' else 'Internship supervisor request declined' end,
    case when p_approve
      then 'Your internship request has been approved. You are now officially assigned.'
      else 'Your request was declined: ' || p_reason || '. Select a different supervisor and resubmit.'
    end,
    'internship_assignments', v_assignment.id
  );

  return v_assignment;
end;
$$;

-- RLS ---------------------------------------------------------------------

alter table internship_assignments enable row level security;
alter table internship_supervisor_requests enable row level security;
alter table internship_supervisor_capacity enable row level security;

create policy "internship_assignments_select_scoped" on internship_assignments
  for select to authenticated
  using (
    student_profile_id = auth.uid()
    or supervisor_profile_id = auth.uid()
    or current_user_role() in ('admin', 'principal')
    or is_central_internship_focal()
    or is_departmental_internship_focal(department_id)
    or (current_user_role() = 'department' and department_id = current_department_id())
  );
-- Inserts/transitions happen only via apply_for_internship() /
-- respond_to_internship_supervision() (SECURITY DEFINER, bypasses RLS).
-- Admin retains a raw escape hatch for support, same as fyp_groups.
create policy "internship_assignments_update_admin_only" on internship_assignments
  for update to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "internship_supervisor_requests_select_scoped" on internship_supervisor_requests
  for select to authenticated
  using (
    supervisor_profile_id = auth.uid()
    or exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

create policy "internship_supervisor_capacity_select_authenticated" on internship_supervisor_capacity
  for select to authenticated using (true);
create policy "internship_supervisor_capacity_write_admin_or_department" on internship_supervisor_capacity
  for all to authenticated
  using (
    current_user_role() = 'admin'
    or (current_user_role() = 'department' and exists (
      select 1 from profiles p where p.id = profile_id and p.department_id = current_department_id()
    ))
  )
  with check (
    current_user_role() = 'admin'
    or (current_user_role() = 'department' and exists (
      select 1 from profiles p where p.id = profile_id and p.department_id = current_department_id()
    ))
  );
