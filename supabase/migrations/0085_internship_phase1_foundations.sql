-- Internship Management, Phase 1: designations, HOD configuration, and
-- Departmental Focal Person company/MoU management. No student-facing
-- workflow yet (Phase 2+) — this migration only lays the foundation every
-- later phase depends on.

-- Designation helpers ------------------------------------------------------
-- Central/Departmental Internship Focal Person are designations (0054), not
-- new profiles.role values — 0054 already seeded both rows needed
-- ('Internship Focal Person', scope='college') and (..., scope='department').
-- Mirrors is_chief_proctor() (0056) exactly, except "Internship Focal
-- Person" is seeded TWICE with the identical name (unlike Chief/Staff
-- Proctor's distinct names), so dt.scope must be checked explicitly here or
-- a department-scope holder would also satisfy this college-scope check.
create or replace function is_central_internship_focal()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from designation_assignments da
    join designation_types dt on dt.id = da.designation_type_id
    where da.profile_id = auth.uid()
      and dt.name = 'Internship Focal Person' and dt.scope = 'college'
      and da.college_id = current_college_id()
  );
$$;

-- New pattern: department-parameterized designation check. No existing
-- helper does this — is_staff_proctor() only proves "holds the title at
-- this college", not "for this specific department".
create or replace function is_departmental_internship_focal(p_department_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from designation_assignments da
    join designation_types dt on dt.id = da.designation_type_id
    where da.profile_id = auth.uid()
      and dt.name = 'Internship Focal Person' and dt.scope = 'department'
      and da.department_id = p_department_id
  );
$$;

-- Internship configuration (HOD-managed) -----------------------------------
-- Keyed on (department_id, program_id, semester_id) — no separate
-- academic_session_id column, since semesters already belong to exactly
-- one session (mirrors fyp_semester_config's (department_id, semester_id)
-- key, with program_id added since duration/report counts can differ per
-- program within one department). "Eligible batch" is derived at read time
-- from students' current_semester_id/batch, same as department/fyp/page.tsx
-- does today, not stored here.
create table internship_configs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments (id) on delete cascade,
  program_id uuid not null references programs (id) on delete cascade,
  semester_id uuid not null references semesters (id) on delete cascade,
  is_enabled boolean not null default false,
  eligibility_criteria text,
  application_open_date date,
  application_close_date date,
  internship_start_date date,
  internship_end_date date,
  duration_weeks int not null default 9 check (duration_weeks > 0),
  required_reports int not null default 3 check (required_reports > 0),
  report_interval_weeks int not null default 3 check (report_interval_weeks > 0),
  allow_cross_department_supervisor boolean not null default false,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, program_id, semester_id)
);
create index internship_configs_department_idx on internship_configs (department_id);
create trigger internship_configs_set_updated_at before update on internship_configs
  for each row execute function set_updated_at();

-- Companies and MoUs (Departmental Focal Person-managed) -------------------
create table internship_companies (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments (id) on delete cascade,
  name text not null,
  company_type text,
  industry text,
  address text,
  contact_person text,
  contact_number text,
  contact_email text,
  website text,
  internship_domain text,
  available_seats int check (available_seats is null or available_seats >= 0),
  is_active boolean not null default true,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index internship_companies_department_idx on internship_companies (department_id);
create trigger internship_companies_set_updated_at before update on internship_companies
  for each row execute function set_updated_at();

-- One signed MoU document per row (spec says "the signed MoU document",
-- singular); a renewal is a brand-new row rather than an overwrite, so full
-- history is preserved automatically. Multiple simultaneously-'active' rows
-- per company are allowed on purpose (an early renewal before the old one
-- expires is valid) — student selection (Phase 2) only needs "at least one
-- active MoU", never "exactly one".
create table internship_mous (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references internship_companies (id) on delete cascade,
  department_id uuid not null references departments (id) on delete cascade,
  mou_start_date date not null,
  mou_expiry_date date not null check (mou_expiry_date > mou_start_date),
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  document_path text,
  notes text,
  created_by uuid references profiles (id),
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index internship_mous_company_idx on internship_mous (company_id);
create index internship_mous_department_idx on internship_mous (department_id);
create index internship_mous_status_idx on internship_mous (status);
create trigger internship_mous_set_updated_at before update on internship_mous
  for each row execute function set_updated_at();

-- The stored status intentionally only tracks draft/active/inactive, not
-- the spec's full DRAFT/ACTIVE/EXPIRING_SOON/EXPIRED/INACTIVE — this app has
-- no scheduled-job/cron infrastructure anywhere, so persisting time-derived
-- statuses would go stale between page loads. expiring_soon/expired are
-- computed at query time instead.
create or replace function mou_effective_status(p_status text, p_expiry_date date)
returns text
language sql
stable
as $$
  select case
    when p_status = 'inactive' then 'inactive'
    when p_expiry_date < current_date then 'expired'
    when p_expiry_date <= current_date + 30 then 'expiring_soon'
    else p_status
  end;
$$;

-- RLS -----------------------------------------------------------------------

alter table internship_configs enable row level security;
alter table internship_companies enable row level security;
alter table internship_mous enable row level security;

create policy "internship_configs_select_authenticated" on internship_configs
  for select to authenticated using (true);
create policy "internship_configs_write_hod_or_admin" on internship_configs
  for all to authenticated
  using (current_user_role() = 'admin' or (current_user_role() = 'department' and department_id = current_department_id()))
  with check (current_user_role() = 'admin' or (current_user_role() = 'department' and department_id = current_department_id()));

create policy "internship_companies_select_scoped" on internship_companies
  for select to authenticated
  using (
    current_user_role() in ('admin', 'principal')
    or is_central_internship_focal()
    or department_id = current_department_id()
  );
create policy "internship_companies_write_focal_or_admin" on internship_companies
  for all to authenticated
  using (current_user_role() = 'admin' or is_departmental_internship_focal(department_id))
  with check (current_user_role() = 'admin' or is_departmental_internship_focal(department_id));

create policy "internship_mous_select_scoped" on internship_mous
  for select to authenticated
  using (
    current_user_role() in ('admin', 'principal')
    or is_central_internship_focal()
    or department_id = current_department_id()
  );
create policy "internship_mous_write_focal_or_admin" on internship_mous
  for all to authenticated
  using (
    (current_user_role() = 'admin' or is_departmental_internship_focal(department_id))
    and exists (select 1 from internship_companies c where c.id = company_id and c.department_id = internship_mous.department_id)
  )
  with check (
    (current_user_role() = 'admin' or is_departmental_internship_focal(department_id))
    and exists (select 1 from internship_companies c where c.id = company_id and c.department_id = internship_mous.department_id)
  );

-- Storage: MoU documents ----------------------------------------------------
-- Mirrors admission-documents (0010_storage.sql) exactly. Path convention:
-- internship-mou-documents/{mou_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('internship-mou-documents', 'internship-mou-documents', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

create policy "internship_mou_documents_bucket_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'internship-mou-documents'
    and exists (
      select 1 from internship_mous m
      where m.id = ((storage.foldername(name))[1])::uuid and (
        current_user_role() in ('admin', 'principal')
        or is_central_internship_focal()
        or m.department_id = current_department_id()
      )
    )
  );
create policy "internship_mou_documents_bucket_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'internship-mou-documents'
    and exists (
      select 1 from internship_mous m
      where m.id = ((storage.foldername(name))[1])::uuid
        and (current_user_role() = 'admin' or is_departmental_internship_focal(m.department_id))
    )
  );
