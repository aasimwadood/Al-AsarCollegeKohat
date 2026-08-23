-- Fix a real bug caught during live verification of 0086:
-- apply_for_internship()'s capacity check counted
-- internship_assignments.supervisor_profile_id, but that column is only
-- ever populated once a request is APPROVED (respond_to_internship_
-- supervision() sets it) -- it stays null for the entire time a request
-- sits 'supervisor_pending'. So the capacity check silently only ever
-- counted already-confirmed assignments, never the pending requests it was
-- explicitly meant to catch ("prefer preventing selection outright" per
-- spec) -- a supervisor at capacity could still be flooded with pending
-- requests with no block at all.
--
-- Fixed by counting both halves explicitly: assignments with a currently-
-- pending request for this supervisor (via internship_supervisor_requests,
-- the only place the requested supervisor is recorded before approval),
-- union'd with assignments already confirmed to this supervisor.

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
