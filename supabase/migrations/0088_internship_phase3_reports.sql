-- Internship Management, Phase 3: three-week progress reports. Continues
-- §55/§56's roadmap. Report rows are pre-created the moment an assignment
-- becomes 'assigned' (from internship_configs.required_reports, evenly
-- spaced by report_interval_weeks off the assignment's own snapshotted
-- start_date) so a report is always auto-associated with the right
-- internship/period — never something the student picks by hand. Sequential
-- unlock: report N+1 can't be submitted until report N is approved, unless
-- an authorized user sets early_submission_allowed on that specific report.
-- Every submission attempt is preserved in an append-only history table
-- (internship_report_submissions), the same pattern §56 used for supervisor
-- requests, so a rejection is never silently overwritten by the resubmit.

create table internship_reports (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references internship_assignments (id) on delete cascade,
  report_number int not null check (report_number > 0),
  period_start date not null,
  period_end date not null,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'approved', 'rejected')),
  early_submission_allowed boolean not null default false,
  content text,
  document_path text,
  student_remarks text,
  submitted_at timestamptz,
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  review_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, report_number)
);
create index internship_reports_assignment_idx on internship_reports (assignment_id);
create trigger internship_reports_set_updated_at before update on internship_reports
  for each row execute function set_updated_at();

-- Append-only: one row per submission attempt, so a rejected submission's
-- content/remarks survive a later resubmission untouched.
create table internship_report_submissions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references internship_reports (id) on delete cascade,
  content text,
  document_path text,
  student_remarks text,
  submitted_at timestamptz not null default now(),
  status_at_review text check (status_at_review in ('approved', 'rejected')),
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  review_remarks text
);
create index internship_report_submissions_report_idx on internship_report_submissions (report_id);

-- Business logic --------------------------------------------------------

-- Extends respond_to_internship_supervision() (0086) so report rows exist
-- the instant an assignment is confirmed, evenly spaced from the
-- assignment's own snapshotted start_date/duration -- the last report's
-- window is capped at the assignment's real end_date rather than drifting
-- past it if duration_weeks isn't an exact multiple of report_interval_weeks.
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

    for v_report_num in 1..v_config.required_reports loop
      v_period_start := v_assignment.start_date + ((v_report_num - 1) * v_config.report_interval_weeks * 7);
      v_period_end := case
        when v_report_num = v_config.required_reports then v_assignment.end_date
        else v_assignment.start_date + (v_report_num * v_config.report_interval_weeks * 7)
      end;
      insert into internship_reports (assignment_id, report_number, period_start, period_end)
      values (v_assignment.id, v_report_num, v_period_start, v_period_end);
    end loop;
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

create or replace function submit_internship_report(
  p_report_id uuid,
  p_content text,
  p_document_path text default null,
  p_student_remarks text default null
)
returns internship_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report internship_reports;
  v_assignment internship_assignments;
  v_previous_report internship_reports;
begin
  if current_user_role() <> 'student' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_report from internship_reports where id = p_report_id for update;
  if not found then
    raise exception 'report_not_found';
  end if;

  select * into v_assignment from internship_assignments where id = v_report.assignment_id for update;
  if v_assignment.student_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_assignment.status not in ('assigned', 'in_progress') then
    raise exception 'invalid_status: assignment must be assigned or in_progress, got %', v_assignment.status;
  end if;
  if v_report.status not in ('pending', 'rejected') then
    raise exception 'invalid_status: report must be pending or rejected, got %', v_report.status;
  end if;

  if not v_report.early_submission_allowed then
    if current_date < v_report.period_start then
      raise exception 'report_window_not_open';
    end if;
    if v_report.report_number > 1 then
      select * into v_previous_report from internship_reports
        where assignment_id = v_assignment.id and report_number = v_report.report_number - 1;
      if v_previous_report.status <> 'approved' then
        raise exception 'previous_report_not_approved';
      end if;
    end if;
  end if;

  insert into internship_report_submissions (report_id, content, document_path, student_remarks)
  values (p_report_id, p_content, coalesce(p_document_path, v_report.document_path), p_student_remarks);

  update internship_reports
  set status = 'submitted',
      content = p_content,
      document_path = coalesce(p_document_path, document_path),
      student_remarks = p_student_remarks,
      submitted_at = now()
  where id = p_report_id
  returning * into v_report;

  if v_assignment.status = 'assigned' then
    update internship_assignments set status = 'in_progress' where id = v_assignment.id;
  end if;

  if v_assignment.supervisor_profile_id is not null then
    insert into notifications (profile_id, title, body, related_entity, related_id)
    values (
      v_assignment.supervisor_profile_id,
      'Internship report submitted',
      'Report ' || v_report.report_number || ' has been submitted for review.',
      'internship_reports', v_report.id
    );
  end if;

  return v_report;
end;
$$;

create or replace function review_internship_report(
  p_report_id uuid,
  p_approve boolean,
  p_remarks text default null
)
returns internship_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report internship_reports;
  v_assignment internship_assignments;
  v_latest_submission_id uuid;
  v_all_approved boolean;
begin
  if current_user_role() <> 'faculty' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_report from internship_reports where id = p_report_id for update;
  if not found then
    raise exception 'report_not_found';
  end if;

  select * into v_assignment from internship_assignments where id = v_report.assignment_id for update;
  if v_assignment.supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_report.status <> 'submitted' then
    raise exception 'invalid_status: report must be submitted, got %', v_report.status;
  end if;

  select id into v_latest_submission_id from internship_report_submissions
    where report_id = p_report_id order by submitted_at desc limit 1;
  update internship_report_submissions
  set status_at_review = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by = auth.uid(), reviewed_at = now(), review_remarks = p_remarks
  where id = v_latest_submission_id;

  update internship_reports
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by = auth.uid(), reviewed_at = now(), review_remarks = p_remarks
  where id = p_report_id
  returning * into v_report;

  insert into notifications (profile_id, title, body, related_entity, related_id)
  values (
    v_assignment.student_profile_id,
    case when p_approve then 'Internship report approved' else 'Internship report rejected' end,
    case when p_approve
      then 'Report ' || v_report.report_number || ' was approved.'
      else 'Report ' || v_report.report_number || ' was rejected: ' || coalesce(p_remarks, '') || '. Please correct and resubmit.'
    end,
    'internship_reports', v_report.id
  );

  if p_approve then
    select bool_and(status = 'approved') into v_all_approved
      from internship_reports where assignment_id = v_assignment.id;
    if v_all_approved and current_date > v_assignment.end_date then
      update internship_assignments set status = 'completion_pending' where id = v_assignment.id;
      insert into notifications (profile_id, title, body, related_entity, related_id)
      values (
        v_assignment.supervisor_profile_id,
        'Internship final evaluation pending',
        'All reports approved and the internship period has ended. Final evaluation is now pending.',
        'internship_assignments', v_assignment.id
      );
    end if;
  end if;

  return v_report;
end;
$$;

create or replace function set_internship_report_early_submission(p_report_id uuid, p_allow boolean)
returns internship_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report internship_reports;
  v_assignment internship_assignments;
begin
  select * into v_report from internship_reports where id = p_report_id for update;
  if not found then
    raise exception 'report_not_found';
  end if;
  select * into v_assignment from internship_assignments where id = v_report.assignment_id;

  if current_user_role() <> 'admin'
     and not (current_user_role() = 'department' and v_assignment.department_id = current_department_id())
     and not is_departmental_internship_focal(v_assignment.department_id) then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  update internship_reports set early_submission_allowed = p_allow where id = p_report_id returning * into v_report;
  return v_report;
end;
$$;

-- RLS ---------------------------------------------------------------------

alter table internship_reports enable row level security;
alter table internship_report_submissions enable row level security;

create policy "internship_reports_select_scoped" on internship_reports
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
-- Inserts/transitions happen only via the SECURITY DEFINER functions above
-- (respond_to_internship_supervision creates the rows; submit/review
-- mutate them). Admin retains a raw escape hatch for support.
create policy "internship_reports_update_admin_only" on internship_reports
  for update to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "internship_report_submissions_select_scoped" on internship_report_submissions
  for select to authenticated
  using (
    exists (
      select 1 from internship_reports r
      join internship_assignments a on a.id = r.assignment_id
      where r.id = report_id and (
        a.student_profile_id = auth.uid()
        or a.supervisor_profile_id = auth.uid()
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );

-- Storage: report supporting documents -------------------------------------
-- Mirrors internship-mou-documents (0085). Path convention:
-- internship-report-documents/{report_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('internship-report-documents', 'internship-report-documents', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

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
        or current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or is_departmental_internship_focal(a.department_id)
        or (current_user_role() = 'department' and a.department_id = current_department_id())
      )
    )
  );
create policy "internship_report_documents_bucket_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'internship-report-documents'
    and exists (
      select 1 from internship_reports r
      join internship_assignments a on a.id = r.assignment_id
      where r.id = ((storage.foldername(name))[1])::uuid and a.student_profile_id = auth.uid()
    )
  );
