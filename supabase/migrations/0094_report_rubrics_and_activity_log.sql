-- Internship workflow update, Phase 4: the uploaded "Student Internship
-- Report Form" / "Site Supervisor Evaluation Form" / "Sample Student
-- Internship Activity Log" turned out to describe the exact same three
-- periodic reports already built in 0088/0093 (Report Number 1/2/3), not a
-- separate "final report" -- there is no fourth, distinct wrap-up document
-- anywhere in it. Two real changes follow from the real document:
--   1. The reports' free-text fields are replaced with the document's own
--      structured shape: three named student fields (not one blob), a
--      9-criterion 1-5 scored rubric for the Site Supervisor, and a
--      3-criterion 1-5 scored rubric for the Academic Supervisor.
--   2. A new, separate 9-week Activity Log (weekly tasks + hours, signed by
--      all three parties) that nothing built so far covers -- distinct from
--      the daily Present/Absent/Leave/Half-Day attendance module (0092).
-- The originally-planned separate internship_final_reports table (Phase 4
-- as scoped before the document arrived) is dropped: Report 3 already IS
-- the final periodic report, and completion_pending already triggers once
-- all reports (including it) are approved and the period has ended (0088).

-- Report fields -------------------------------------------------------

alter table internship_reports add column tasks_performed text;
alter table internship_reports add column learning_experience text;
alter table internship_reports add column challenges text;
alter table internship_reports add column site_supervisor_scores jsonb;
alter table internship_reports add column academic_scores jsonb;
alter table internship_reports drop column content;
alter table internship_reports drop column site_supervisor_content;

alter table internship_report_submissions add column tasks_performed text;
alter table internship_report_submissions add column learning_experience text;
alter table internship_report_submissions add column challenges text;
alter table internship_report_submissions add column site_supervisor_scores jsonb;
alter table internship_report_submissions add column academic_scores jsonb;
alter table internship_report_submissions drop column content;
alter table internship_report_submissions drop column site_supervisor_content;

-- Old signatures are being replaced with a genuinely different shape (one
-- p_content text param becomes three named text params / a jsonb scores
-- param), which create-or-replace can't do in place -- explicit drop first.
drop function if exists submit_internship_report(uuid, text, text, text);
drop function if exists submit_site_supervisor_report_section(uuid, boolean, text, text);

create or replace function submit_internship_report(
  p_report_id uuid,
  p_tasks_performed text,
  p_learning_experience text,
  p_challenges text,
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

  insert into internship_report_submissions (report_id, tasks_performed, learning_experience, challenges, document_path, student_remarks)
  values (p_report_id, p_tasks_performed, p_learning_experience, p_challenges, coalesce(p_document_path, v_report.document_path), p_student_remarks);

  update internship_reports
  set status = 'submitted',
      tasks_performed = p_tasks_performed, learning_experience = p_learning_experience, challenges = p_challenges,
      document_path = coalesce(p_document_path, document_path),
      student_remarks = p_student_remarks,
      submitted_at = now(),
      site_supervisor_scores = null, site_supervisor_remarks = null,
      site_supervisor_reviewed_by = null, site_supervisor_reviewed_at = null,
      academic_scores = null, review_remarks = null, reviewed_by = null, reviewed_at = null
  where id = p_report_id
  returning * into v_report;

  if v_assignment.status = 'assigned' then
    update internship_assignments set status = 'in_progress' where id = v_assignment.id;
  end if;

  if v_assignment.site_supervisor_profile_id is not null then
    insert into notifications (profile_id, title, body, related_entity, related_id)
    values (
      v_assignment.site_supervisor_profile_id,
      'Internship report submitted',
      'Report ' || v_report.report_number || ' has been submitted for your review.',
      'internship_reports', v_report.id
    );
  end if;

  return v_report;
end;
$$;

-- Site Supervisor's own stage -- now a 9-criterion 1-5 scored rubric
-- (Section "Site Supervisor Evaluation Form" in the uploaded document)
-- instead of free text. Rejecting still only requires a reason; the rubric
-- is only required (and validated) when approving/forwarding.
create or replace function submit_site_supervisor_report_section(
  p_report_id uuid,
  p_approve boolean,
  p_scores jsonb default null,
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
  v_key text;
  v_val int;
begin
  if current_user_role() <> 'site_supervisor' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if not p_approve and (p_remarks is null or trim(p_remarks) = '') then
    raise exception 'reason_required';
  end if;

  select * into v_report from internship_reports where id = p_report_id for update;
  if not found then
    raise exception 'report_not_found';
  end if;

  select * into v_assignment from internship_assignments where id = v_report.assignment_id;
  if v_assignment.site_supervisor_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_report.status <> 'submitted' then
    raise exception 'invalid_status: report must be submitted, got %', v_report.status;
  end if;

  if p_approve then
    foreach v_key in array array[
      'punctuality', 'respect_for_norms', 'organizational_understanding', 'workplace_skills',
      'professional_conduct', 'initiative', 'task_completion', 'teamwork', 'reliability'
    ] loop
      v_val := (p_scores ->> v_key)::int;
      if v_val is null or v_val < 1 or v_val > 5 then
        raise exception 'invalid_scores: % must be an integer from 1 to 5', v_key;
      end if;
    end loop;
  end if;

  select id into v_latest_submission_id from internship_report_submissions
    where report_id = p_report_id order by submitted_at desc limit 1;
  update internship_report_submissions
  set site_supervisor_status = case when p_approve then 'forwarded' else 'rejected' end,
      site_supervisor_scores = p_scores, site_supervisor_remarks = p_remarks,
      site_supervisor_reviewed_by = auth.uid(), site_supervisor_reviewed_at = now()
  where id = v_latest_submission_id;

  update internship_reports
  set status = case when p_approve then 'site_supervisor_submitted' else 'rejected' end,
      site_supervisor_scores = p_scores, site_supervisor_remarks = p_remarks,
      site_supervisor_reviewed_by = auth.uid(), site_supervisor_reviewed_at = now()
  where id = p_report_id
  returning * into v_report;

  if p_approve then
    if v_assignment.supervisor_profile_id is not null then
      insert into notifications (profile_id, title, body, related_entity, related_id)
      values (
        v_assignment.supervisor_profile_id,
        'Internship report ready for academic review',
        'Report ' || v_report.report_number || ' has been reviewed by the site supervisor and is ready for your review.',
        'internship_reports', v_report.id
      );
    end if;
  else
    insert into notifications (profile_id, title, body, related_entity, related_id)
    values (
      v_assignment.student_profile_id,
      'Internship report rejected',
      'Report ' || v_report.report_number || ' was rejected by your site supervisor: ' || p_remarks || '. Please correct and resubmit.',
      'internship_reports', v_report.id
    );
  end if;

  return v_report;
end;
$$;

-- Academic Supervisor's review -- same signature plus a new trailing
-- p_scores param (Section-B's 3-criterion rubric), which create-or-replace
-- can add in place since every existing required/defaulted param is
-- unchanged. Only validated when approving, same as the site-supervisor
-- side; the reject-requires-remarks behavior is unchanged from 0088 (never
-- enforced at the DB layer there either -- only by the client-side schema).
create or replace function review_internship_report(
  p_report_id uuid,
  p_approve boolean,
  p_remarks text default null,
  p_scores jsonb default null
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
  v_key text;
  v_val int;
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
  if v_report.status <> 'site_supervisor_submitted' then
    raise exception 'invalid_status: report must be site_supervisor_submitted, got %', v_report.status;
  end if;

  if p_approve then
    foreach v_key in array array['tasks_performed', 'learning_experience', 'overcoming_challenges'] loop
      v_val := (p_scores ->> v_key)::int;
      if v_val is null or v_val < 1 or v_val > 5 then
        raise exception 'invalid_scores: % must be an integer from 1 to 5', v_key;
      end if;
    end loop;
  end if;

  select id into v_latest_submission_id from internship_report_submissions
    where report_id = p_report_id order by submitted_at desc limit 1;
  update internship_report_submissions
  set status_at_review = case when p_approve then 'approved' else 'rejected' end,
      academic_scores = p_scores,
      reviewed_by = auth.uid(), reviewed_at = now(), review_remarks = p_remarks
  where id = v_latest_submission_id;

  update internship_reports
  set status = case when p_approve then 'approved' else 'rejected' end,
      academic_scores = p_scores,
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

-- Activity Log ----------------------------------------------------------
-- The document's "Sample Student Internship Activity Log": one row per
-- week (task description + hours), spanning the whole internship, filled
-- by the student and signed off by all three parties at the end. Distinct
-- from internship_attendance (0092), which only tracks daily
-- present/absent/leave/half-day status, not weekly tasks or hours.

create table internship_activity_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references internship_assignments (id) on delete cascade,
  week_number int not null check (week_number > 0),
  tasks_performed text,
  hours numeric(5, 2),
  updated_at timestamptz not null default now(),
  unique (assignment_id, week_number)
);
create index internship_activity_logs_assignment_idx on internship_activity_logs (assignment_id);
create trigger internship_activity_logs_set_updated_at before update on internship_activity_logs
  for each row execute function set_updated_at();

alter table internship_assignments add column activity_log_student_signed_at timestamptz;
alter table internship_assignments add column activity_log_site_supervisor_signed_at timestamptz;
alter table internship_assignments add column activity_log_academic_signed_at timestamptz;

-- Student-only, upsert-per-week, locked the moment the student themself
-- signs off (mirrors the "locked, correction only via a separate
-- authorized path" shape 0092 established for attendance, minus the
-- correction path since this is student-authored record-keeping, not a
-- site-supervisor-verified attendance record).
create or replace function update_internship_activity_log(
  p_assignment_id uuid,
  p_week_number int,
  p_tasks_performed text,
  p_hours numeric
)
returns internship_activity_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
  v_row internship_activity_logs;
begin
  if current_user_role() <> 'student' then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_assignment from internship_assignments where id = p_assignment_id;
  if not found or v_assignment.student_profile_id <> auth.uid() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if v_assignment.activity_log_student_signed_at is not null then
    raise exception 'activity_log_already_signed';
  end if;
  if p_week_number < 1 or p_week_number > v_assignment.duration_weeks then
    raise exception 'invalid_week_number';
  end if;

  insert into internship_activity_logs (assignment_id, week_number, tasks_performed, hours)
  values (p_assignment_id, p_week_number, p_tasks_performed, p_hours)
  on conflict (assignment_id, week_number)
  do update set tasks_performed = excluded.tasks_performed, hours = excluded.hours, updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- Each party signs independently; the student must sign first (they own
-- the record being signed off on), matching the paper form's own
-- Student -> Site Supervisor -> Academic Supervisor ordering used
-- throughout this workflow.
create or replace function sign_internship_activity_log(p_assignment_id uuid)
returns internship_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment internship_assignments;
  v_role text;
begin
  v_role := current_user_role();
  select * into v_assignment from internship_assignments where id = p_assignment_id for update;
  if not found then
    raise exception 'assignment_not_found';
  end if;

  if v_role = 'student' and v_assignment.student_profile_id = auth.uid() then
    update internship_assignments set activity_log_student_signed_at = now() where id = p_assignment_id returning * into v_assignment;
  elsif v_role = 'site_supervisor' and v_assignment.site_supervisor_profile_id = auth.uid() then
    if v_assignment.activity_log_student_signed_at is null then
      raise exception 'student_must_sign_first';
    end if;
    update internship_assignments set activity_log_site_supervisor_signed_at = now() where id = p_assignment_id returning * into v_assignment;
  elsif v_role = 'faculty' and v_assignment.supervisor_profile_id = auth.uid() then
    if v_assignment.activity_log_student_signed_at is null then
      raise exception 'student_must_sign_first';
    end if;
    update internship_assignments set activity_log_academic_signed_at = now() where id = p_assignment_id returning * into v_assignment;
  else
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  return v_assignment;
end;
$$;

alter table internship_activity_logs enable row level security;
create policy "internship_activity_logs_select_scoped" on internship_activity_logs
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
