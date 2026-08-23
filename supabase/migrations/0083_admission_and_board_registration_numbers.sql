-- Intermediate students' Admission No and Registration No are issued by
-- the BISE board, not generated internally the way BS's GPCK-{year}-{dept}-{seq}
-- registration_number is (admit_student(), 0068) — so these are new,
-- separate, freely-editable fields rather than a change to the existing
-- auto-generated registration_number, which keeps working exactly as
-- before. Added on both `admissions` (editable pre- or post-admit) and
-- `profiles` (editable after the student has an account) since this app
-- already keeps shift_id/group_id/section_id as independent fields on both
-- tables rather than syncing one into the other (0072/0074) — same
-- reasoning applies here.

alter table admissions add column admission_number text;
alter table admissions add column board_registration_number text;
alter table profiles add column admission_number text;
alter table profiles add column board_registration_number text;

-- Mirrors assign_admission_shift()'s exact scope shape (0072/0076).
create or replace function set_admission_identifiers(p_admission_id uuid, p_admission_number text, p_board_registration_number text)
returns admissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admission admissions;
begin
  if current_user_role() not in ('admin', 'department', 'faculty', 'focal_person_intermediate') then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_admission from admissions where id = p_admission_id for update;
  if not found then
    raise exception 'admission_not_found';
  end if;

  if current_user_role() in ('department', 'faculty', 'focal_person_intermediate')
     and v_admission.department_id <> current_department_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if current_user_role() = 'admin' and department_college_id(v_admission.department_id) <> current_college_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  update admissions
  set admission_number = nullif(trim(p_admission_number), ''),
      board_registration_number = nullif(trim(p_board_registration_number), '')
  where id = p_admission_id
  returning * into v_admission;

  return v_admission;
end;
$$;

-- Mirrors bulk_assign_student_shift()'s exact scope shape (0077), single
-- student rather than an array since this is inline-editing a text field
-- per row, not a checkbox-select bulk action.
create or replace function set_student_identifiers(p_student_id uuid, p_admission_number text, p_board_registration_number text)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
begin
  if current_user_role() not in ('admin', 'department', 'focal_person_intermediate') then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_profile from profiles where id = p_student_id for update;
  if not found then
    raise exception 'student_not_found';
  end if;

  if current_user_role() in ('department', 'focal_person_intermediate') and v_profile.department_id <> current_department_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if current_user_role() = 'admin' and v_profile.college_id <> current_college_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  update profiles
  set admission_number = nullif(trim(p_admission_number), ''),
      board_registration_number = nullif(trim(p_board_registration_number), '')
  where id = p_student_id
  returning * into v_profile;

  return v_profile;
end;
$$;
