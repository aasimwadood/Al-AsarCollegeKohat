-- Internship workflow update: Site Supervisor role, host-organization
-- linkage, and dual-approval assignment workflow. Extends (does not
-- replace) 0086's application/supervision RPCs and 0088/0089's read
-- scoping — the Academic Supervisor's own accept/reject mechanism keeps its
-- exact current signature, button, and rejection-reason requirement; this
-- migration adds a second, independent, symmetric approval gate that must
-- ALSO pass before an assignment is confirmed.

-- Host-organization linkage: which Site Supervisor profiles belong to which
-- company. Structural copy of course_faculty (0003) -- a supervisor can in
-- principle be linked to more than one company.
create table internship_company_supervisors (
  company_id uuid not null references internship_companies (id) on delete cascade,
  supervisor_profile_id uuid not null references profiles (id) on delete cascade,
  primary key (company_id, supervisor_profile_id)
);
create index internship_company_supervisors_supervisor_idx on internship_company_supervisors (supervisor_profile_id);

alter table internship_assignments add column site_supervisor_profile_id uuid references profiles (id);
create index internship_assignments_site_supervisor_idx on internship_assignments (site_supervisor_profile_id);

-- Append-only, same shape as internship_supervisor_requests (0086). The
-- extra 'cancelled' status (not present on the academic-side table) is used
-- when the OTHER side rejects first -- since a rejection from either party
-- sends the whole application back to the student to re-pick organization +
-- Site Supervisor + Academic Supervisor together, the still-pending request
-- on the other table must not linger as an actionable item.
create table internship_site_supervisor_requests (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references internship_assignments (id) on delete cascade,
  site_supervisor_profile_id uuid not null references profiles (id),
  status text not null default 'pending' check (status in ('pending', 'agreed', 'disagreed', 'cancelled')),
  reason text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  responded_by uuid references profiles (id)
);
create index internship_site_supervisor_requests_assignment_idx on internship_site_supervisor_requests (assignment_id);
create index internship_site_supervisor_requests_supervisor_idx on internship_site_supervisor_requests (site_supervisor_profile_id);

-- Give the academic-side table the same 'cancelled' status for full
-- symmetry, so a site-supervisor rejection can honestly record "cancelled"
-- on a still-pending academic request rather than misrepresenting it as
-- 'disagreed' (which would imply the academic supervisor personally
-- responded, when they never did).
alter table internship_supervisor_requests drop constraint internship_supervisor_requests_status_check;
alter table internship_supervisor_requests add constraint internship_supervisor_requests_status_check
  check (status in ('pending', 'agreed', 'disagreed', 'cancelled'));

-- Business logic --------------------------------------------------------

create or replace function apply_for_internship(
  p_config_id uuid,
  p_company_id uuid,
  p_supervisor_profile_id uuid,
  p_site_supervisor_profile_id uuid
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
  v_site_supervisor profiles;
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

  select * into v_site_supervisor from profiles where id = p_site_supervisor_profile_id and role = 'site_supervisor';
  if not found then
    raise exception 'invalid_site_supervisor: must be a site supervisor';
  end if;
  if not exists (
    select 1 from internship_company_supervisors
    where company_id = p_company_id and supervisor_profile_id = p_site_supervisor_profile_id
  ) then
    raise exception 'invalid_site_supervisor: must belong to the selected company';
  end if;

  select capacity into v_capacity from internship_supervisor_capacity where profile_id = p_supervisor_profile_id;
  if v_capacity is not null then
    select count(*) into v_current_load from (
      select a.id from internship_assignments a
        join internship_supervisor_requests r on r.assignment_id = a.id
        where r.supervisor_profile_id = p_supervisor_profile_id and r.status = 'pending'
      union
      select a.id from internship_assignments a
        where a.supervisor_profile_id = p_supervisor_profile_id and a.status in ('assigned', 'in_progress')
    ) load;
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
    set company_id = p_company_id, mou_id = v_mou.id, status = 'supervisor_pending',
        supervisor_profile_id = null, site_supervisor_profile_id = null
    where id = v_assignment.id
    returning * into v_assignment;
  else
    insert into internship_assignments (student_profile_id, config_id, department_id, company_id, mou_id, duration_weeks, status)
    values (auth.uid(), p_config_id, v_config.department_id, p_company_id, v_mou.id, v_config.duration_weeks, 'supervisor_pending')
    returning * into v_assignment;
  end if;

  insert into internship_supervisor_requests (assignment_id, supervisor_profile_id)
  values (v_assignment.id, p_supervisor_profile_id);

  insert into internship_site_supervisor_requests (assignment_id, site_supervisor_profile_id)
  values (v_assignment.id, p_site_supervisor_profile_id);

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    p_supervisor_profile_id,
    'New internship supervision request',
    coalesce(v_student.full_name, 'A student') || ' requested you as their academic supervisor (' || v_company.name || ')',
    'internship_assignments', v_assignment.id
  );
  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    p_site_supervisor_profile_id,
    'New internship supervision request',
    coalesce(v_student.full_name, 'A student') || ' requested you as their site supervisor',
    'internship_assignments', v_assignment.id
  );

  return v_assignment;
end;
$$;

-- Academic Supervisor's own accept/reject RPC — unchanged signature, button,
-- and rejection-reason requirement. The only change: approval now finalizes
-- the assignment (status -> assigned, report rows created) only once the
-- Site Supervisor side has ALSO approved; otherwise it records this side's
-- approval and leaves the assignment awaiting the other party.
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
  v_report_num int;
  v_period_start date;
  v_period_end date;
  v_both_approved boolean;
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
    v_both_approved := v_assignment.site_supervisor_profile_id is not null;

    update internship_assignments set supervisor_profile_id = auth.uid() where id = v_assignment.id
    returning * into v_assignment;

    if v_both_approved then
      select * into v_config from internship_configs where id = v_assignment.config_id;
      update internship_assignments
      set status = 'assigned', start_date = v_config.internship_start_date, end_date = v_config.internship_end_date,
          assigned_at = now()
      where id = v_assignment.id
      returning * into v_assignment;

      for v_report_num in 1..v_config.required_reports loop
        v_period_start := v_assignment.start_date + ((v_report_num - 1) * v_config.report_interval_weeks * 7);
        v_period_end := case
          when v_report_num = v_config.required_reports then v_assignment.end_date
          else v_assignment.start_date + (v_report_num * v_config.report_interval_weeks * 7)
        end;
        insert into internship_reports (assignment_id, report_number, period_start, period_end)
        values (v_assignment.id, v_report_num, v_period_start, v_period_end);
      end loop;
    end if;
  else
    update internship_assignments
    set status = 'supervisor_rejected', supervisor_profile_id = null, site_supervisor_profile_id = null
    where id = v_assignment.id
    returning * into v_assignment;

    update internship_site_supervisor_requests
    set status = 'cancelled'
    where assignment_id = v_assignment.id and status = 'pending';
  end if;

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    v_assignment.student_profile_id,
    case when p_approve then 'Academic supervisor approved' else 'Academic supervisor request declined' end,
    case
      when not p_approve then 'Your academic supervisor declined: ' || p_reason || '. Select a different organization/supervisors and resubmit.'
      when v_both_approved then 'Your internship request has been approved by both supervisors. You are now officially assigned.'
      else 'Your academic supervisor has approved your request. Waiting for your site supervisor to respond.'
    end,
    'internship_assignments', v_assignment.id
  );

  return v_assignment;
end;
$$;

-- Site Supervisor's own accept/reject RPC -- new, symmetric twin of the
-- academic one above. Same finalize-only-if-both-approved logic; a
-- rejection here cancels the academic side's still-pending request too.
create or replace function respond_to_internship_site_supervision(
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
  v_request internship_site_supervisor_requests;
  v_assignment internship_assignments;
  v_config internship_configs;
  v_report_num int;
  v_period_start date;
  v_period_end date;
  v_both_approved boolean;
begin
  if current_user_role() <> 'site_supervisor' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_request from internship_site_supervisor_requests where id = p_request_id for update;
  if not found then
    raise exception 'request_not_found';
  end if;
  if v_request.site_supervisor_profile_id <> auth.uid() then
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

  update internship_site_supervisor_requests
  set status = case when p_approve then 'agreed' else 'disagreed' end,
      reason = case when p_approve then null else p_reason end,
      responded_at = now(),
      responded_by = auth.uid()
  where id = p_request_id;

  if p_approve then
    v_both_approved := v_assignment.supervisor_profile_id is not null;

    update internship_assignments set site_supervisor_profile_id = auth.uid() where id = v_assignment.id
    returning * into v_assignment;

    if v_both_approved then
      select * into v_config from internship_configs where id = v_assignment.config_id;
      update internship_assignments
      set status = 'assigned', start_date = v_config.internship_start_date, end_date = v_config.internship_end_date,
          assigned_at = now()
      where id = v_assignment.id
      returning * into v_assignment;

      for v_report_num in 1..v_config.required_reports loop
        v_period_start := v_assignment.start_date + ((v_report_num - 1) * v_config.report_interval_weeks * 7);
        v_period_end := case
          when v_report_num = v_config.required_reports then v_assignment.end_date
          else v_assignment.start_date + (v_report_num * v_config.report_interval_weeks * 7)
        end;
        insert into internship_reports (assignment_id, report_number, period_start, period_end)
        values (v_assignment.id, v_report_num, v_period_start, v_period_end);
      end loop;
    end if;
  else
    update internship_assignments
    set status = 'supervisor_rejected', site_supervisor_profile_id = null, supervisor_profile_id = null
    where id = v_assignment.id
    returning * into v_assignment;

    update internship_supervisor_requests
    set status = 'cancelled'
    where assignment_id = v_assignment.id and status = 'pending';
  end if;

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    v_assignment.student_profile_id,
    case when p_approve then 'Site supervisor approved' else 'Site supervisor request declined' end,
    case
      when not p_approve then 'Your site supervisor declined: ' || p_reason || '. Select a different organization/supervisors and resubmit.'
      when v_both_approved then 'Your internship request has been approved by both supervisors. You are now officially assigned.'
      else 'Your site supervisor has approved your request. Waiting for your academic supervisor to respond.'
    end,
    'internship_assignments', v_assignment.id
  );

  return v_assignment;
end;
$$;

-- RLS ---------------------------------------------------------------------

alter table internship_company_supervisors enable row level security;
alter table internship_site_supervisor_requests enable row level security;

create policy "internship_company_supervisors_select_scoped" on internship_company_supervisors
  for select to authenticated
  using (
    supervisor_profile_id = auth.uid()
    or current_user_role() in ('admin', 'principal')
    or is_central_internship_focal()
    or exists (
      select 1 from internship_companies c where c.id = company_id and (
        is_departmental_internship_focal(c.department_id)
        or c.department_id = current_department_id()
      )
    )
  );
create policy "internship_company_supervisors_write_focal_or_admin" on internship_company_supervisors
  for all to authenticated
  using (
    current_user_role() = 'admin'
    or exists (select 1 from internship_companies c where c.id = company_id and is_departmental_internship_focal(c.department_id))
  )
  with check (
    current_user_role() = 'admin'
    or exists (select 1 from internship_companies c where c.id = company_id and is_departmental_internship_focal(c.department_id))
  );

create policy "internship_site_supervisor_requests_select_scoped" on internship_site_supervisor_requests
  for select to authenticated
  using (
    site_supervisor_profile_id = auth.uid()
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

-- Extend the existing internship_assignments select policy so a Site
-- Supervisor can see their own assigned students, same as the Academic
-- Supervisor branch already there.
drop policy "internship_assignments_select_scoped" on internship_assignments;
create policy "internship_assignments_select_scoped" on internship_assignments
  for select to authenticated
  using (
    student_profile_id = auth.uid()
    or supervisor_profile_id = auth.uid()
    or site_supervisor_profile_id = auth.uid()
    or current_user_role() in ('admin', 'principal')
    or is_central_internship_focal()
    or is_departmental_internship_focal(department_id)
    or (current_user_role() = 'department' and department_id = current_department_id())
  );

-- Same extension on every downstream table that already scopes read access
-- through "a.supervisor_profile_id = auth.uid()" (0088/0089) -- a Site
-- Supervisor gets read access to reports/evaluation/certificate for their
-- own assigned students, and nothing else in the college system.
drop policy "internship_reports_select_scoped" on internship_reports;
create policy "internship_reports_select_scoped" on internship_reports
  for select to authenticated
  using (
    exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or a.site_supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

drop policy "internship_report_submissions_select_scoped" on internship_report_submissions;
create policy "internship_report_submissions_select_scoped" on internship_report_submissions
  for select to authenticated
  using (
    exists (
      select 1 from internship_reports r
      join internship_assignments a on a.id = r.assignment_id
      where r.id = report_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or a.site_supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

drop policy "internship_report_documents_bucket_select" on storage.objects;
create policy "internship_report_documents_bucket_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'internship-report-documents'
    and exists (
      select 1 from internship_reports r
      join internship_assignments a on a.id = r.assignment_id
      where r.id = ((storage.foldername(name))[1])::uuid and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or a.site_supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

drop policy "internship_evaluations_select_scoped" on internship_evaluations;
create policy "internship_evaluations_select_scoped" on internship_evaluations
  for select to authenticated
  using (
    exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or a.site_supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

drop policy "internship_certificates_select_scoped" on internship_certificates;
create policy "internship_certificates_select_scoped" on internship_certificates
  for select to authenticated
  using (
    exists (
      select 1 from internship_assignments a where a.id = assignment_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or a.site_supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );
