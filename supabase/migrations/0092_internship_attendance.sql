-- Internship workflow update, Phase 2: weekly attendance, maintained by the
-- Site Supervisor. No pre-generated placeholder rows -- working dates for a
-- given week are computed in the app layer from the assignment's own
-- snapshotted start_date plus this config's working_days, and a row only
-- ever exists once the Site Supervisor actually marks that date. Once a
-- week is locked, the only way to change a row is the correction RPC below,
-- which always leaves a permanent record of what changed and why -- the
-- same append-only-audit-trail principle 0086/0088 already established for
-- supervisor requests and report submissions, applied here since the
-- existing course `attendance` table (0023) has no such protection at all.

alter table internship_configs add column working_days int[] not null default '{1,2,3,4,5}';

create table internship_attendance (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references internship_assignments (id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'leave', 'half_day')),
  marked_by uuid references profiles (id),
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, attendance_date)
);
create index internship_attendance_assignment_idx on internship_attendance (assignment_id);
create trigger internship_attendance_set_updated_at before update on internship_attendance
  for each row execute function set_updated_at();

-- Append-only correction log -- the only trace of a change to a locked row.
create table internship_attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references internship_attendance (id) on delete cascade,
  old_status text not null,
  new_status text not null,
  changed_by uuid references profiles (id),
  reason text not null,
  changed_at timestamptz not null default now()
);
create index internship_attendance_corrections_attendance_idx on internship_attendance_corrections (attendance_id);

-- Business logic --------------------------------------------------------

-- Fail-closed, all-or-nothing over the whole batch -- the Site Supervisor is
-- hand-picking known dates from their own UI (like bulk_assign_student_shift's
-- checkbox roster), not uploading unreliable external data, so any invalid
-- entry in the batch is a bug/tampering signal that should void the whole
-- call rather than silently applying the rest.
create or replace function mark_internship_attendance(p_assignment_id uuid, p_entries jsonb)
returns setof internship_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
  v_entry jsonb;
  v_date date;
  v_status text;
  v_existing internship_attendance;
begin
  if current_user_role() <> 'site_supervisor' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_assignment from internship_assignments where id = p_assignment_id for update;
  if not found then
    raise exception 'assignment_not_found';
  end if;
  if v_assignment.site_supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_assignment.status not in ('assigned', 'in_progress') then
    raise exception 'invalid_status: assignment must be assigned or in_progress, got %', v_assignment.status;
  end if;

  for v_entry in select * from jsonb_array_elements(p_entries) loop
    v_date := (v_entry ->> 'date')::date;
    v_status := v_entry ->> 'status';
    if v_status not in ('present', 'absent', 'leave', 'half_day') then
      raise exception 'invalid_status_value: %', v_status;
    end if;

    select * into v_existing from internship_attendance where assignment_id = p_assignment_id and attendance_date = v_date;
    if found and v_existing.locked then
      raise exception 'attendance_locked: % is already locked, use the correction path', v_date;
    end if;
  end loop;

  for v_entry in select * from jsonb_array_elements(p_entries) loop
    v_date := (v_entry ->> 'date')::date;
    v_status := v_entry ->> 'status';
    insert into internship_attendance (assignment_id, attendance_date, status, marked_by)
    values (p_assignment_id, v_date, v_status, auth.uid())
    on conflict (assignment_id, attendance_date) do update set status = excluded.status, marked_by = excluded.marked_by;
  end loop;

  return query select * from internship_attendance where assignment_id = p_assignment_id order by attendance_date;
end;
$$;

create or replace function lock_internship_attendance_week(p_assignment_id uuid, p_week_start date, p_week_end date)
returns setof internship_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
begin
  if current_user_role() <> 'site_supervisor' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_assignment from internship_assignments where id = p_assignment_id;
  if not found or v_assignment.site_supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  update internship_attendance
  set locked = true
  where assignment_id = p_assignment_id and attendance_date between p_week_start and p_week_end;

  return query select * from internship_attendance
    where assignment_id = p_assignment_id and attendance_date between p_week_start and p_week_end
    order by attendance_date;
end;
$$;

-- The sole authorized override for a locked row. Always writes a
-- correction-log row before changing anything.
create or replace function correct_internship_attendance(p_attendance_id uuid, p_new_status text, p_reason text)
returns internship_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attendance internship_attendance;
  v_assignment internship_assignments;
begin
  if p_new_status not in ('present', 'absent', 'leave', 'half_day') then
    raise exception 'invalid_status_value: %', p_new_status;
  end if;
  if p_reason is null or trim(p_reason) = '' then
    raise exception 'reason_required';
  end if;

  select * into v_attendance from internship_attendance where id = p_attendance_id for update;
  if not found then
    raise exception 'attendance_not_found';
  end if;
  select * into v_assignment from internship_assignments where id = v_attendance.assignment_id;

  if current_user_role() <> 'admin'
     and not (current_user_role() = 'department' and v_assignment.department_id = current_department_id())
     and not is_departmental_internship_focal(v_assignment.department_id)
     and not is_central_internship_focal() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  insert into internship_attendance_corrections (attendance_id, old_status, new_status, changed_by, reason)
  values (p_attendance_id, v_attendance.status, p_new_status, auth.uid(), p_reason);

  update internship_attendance set status = p_new_status where id = p_attendance_id returning * into v_attendance;
  return v_attendance;
end;
$$;

-- RLS ---------------------------------------------------------------------

alter table internship_attendance enable row level security;
alter table internship_attendance_corrections enable row level security;

create policy "internship_attendance_select_scoped" on internship_attendance
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
-- Inserts/transitions happen only via the SECURITY DEFINER functions above.
-- Admin retains a raw escape hatch for support, same shape as every other
-- internship table.
create policy "internship_attendance_update_admin_only" on internship_attendance
  for update to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "internship_attendance_corrections_select_scoped" on internship_attendance_corrections
  for select to authenticated
  using (
    exists (
      select 1 from internship_attendance att
      join internship_assignments a on a.id = att.assignment_id
      where att.id = attendance_id and (
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
