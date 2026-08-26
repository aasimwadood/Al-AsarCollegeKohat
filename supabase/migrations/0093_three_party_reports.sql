-- Internship workflow update, Phase 3: the three periodic progress reports
-- become a three-party Student -> Site Supervisor -> Academic Supervisor
-- workflow. Extends (does not replace) 0088's report tables/RPCs via
-- create or replace function, the same fix-forward convention 0091/0092
-- already used to extend 0086. submit_internship_report() (student) and
-- review_internship_report() (academic supervisor) keep their exact
-- existing signatures and reject-requires-remarks rules; the only new
-- required step is the Site Supervisor's own stage in between.

alter table internship_reports add column site_supervisor_content text;
alter table internship_reports add column site_supervisor_remarks text;
alter table internship_reports add column site_supervisor_reviewed_by uuid references profiles (id);
alter table internship_reports add column site_supervisor_reviewed_at timestamptz;

alter table internship_reports drop constraint internship_reports_status_check;
alter table internship_reports add constraint internship_reports_status_check
  check (status in ('pending', 'submitted', 'site_supervisor_submitted', 'approved', 'rejected'));

-- Per-submission history for the Site Supervisor's own stage, mirroring the
-- existing status_at_review/reviewed_by/reviewed_at/review_remarks columns
-- that already record the Academic Supervisor's verdict per submission --
-- a Site Supervisor rejection is just as real an auditable event and needs
-- its own permanent trace, not a shared/overwritten one.
alter table internship_report_submissions add column site_supervisor_status text
  check (site_supervisor_status in ('pending', 'forwarded', 'rejected')) default 'pending';
alter table internship_report_submissions add column site_supervisor_content text;
alter table internship_report_submissions add column site_supervisor_remarks text;
alter table internship_report_submissions add column site_supervisor_reviewed_by uuid references profiles (id);
alter table internship_report_submissions add column site_supervisor_reviewed_at timestamptz;

-- Business logic --------------------------------------------------------

-- Student's own submission RPC -- unchanged validation/resubmission logic.
-- The only change: the submitted report now notifies the Site Supervisor
-- first (the new first reviewer), not the Academic Supervisor directly; and
-- a fresh submission clears any stale Site Supervisor review fields left
-- over from a previous (rejected) cycle on this same report row, since the
-- append-only history table already preserves that old cycle permanently.
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
      submitted_at = now(),
      site_supervisor_content = null, site_supervisor_remarks = null,
      site_supervisor_reviewed_by = null, site_supervisor_reviewed_at = null,
      review_remarks = null, reviewed_by = null, reviewed_at = null
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

-- Site Supervisor's own stage -- new. Approving/forwarding moves the report
-- to site_supervisor_submitted (now actionable by the Academic Supervisor);
-- rejecting sends it straight back to the student, same resubmission path
-- report rejection already has.
create or replace function submit_site_supervisor_report_section(
  p_report_id uuid,
  p_approve boolean,
  p_content text default null,
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

  select id into v_latest_submission_id from internship_report_submissions
    where report_id = p_report_id order by submitted_at desc limit 1;
  update internship_report_submissions
  set site_supervisor_status = case when p_approve then 'forwarded' else 'rejected' end,
      site_supervisor_content = p_content, site_supervisor_remarks = p_remarks,
      site_supervisor_reviewed_by = auth.uid(), site_supervisor_reviewed_at = now()
  where id = v_latest_submission_id;

  update internship_reports
  set status = case when p_approve then 'site_supervisor_submitted' else 'rejected' end,
      site_supervisor_content = p_content, site_supervisor_remarks = p_remarks,
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

-- Academic Supervisor's own review RPC -- same signature, same
-- reject-requires-remarks rule, same completion_pending trigger on the last
-- report. The only change: a report must have already cleared the Site
-- Supervisor's stage (site_supervisor_submitted), not merely 'submitted'.
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
  if v_report.status <> 'site_supervisor_submitted' then
    raise exception 'invalid_status: report must be site_supervisor_submitted, got %', v_report.status;
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
