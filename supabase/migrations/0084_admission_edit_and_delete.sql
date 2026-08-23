-- Full edit + delete for admission records. §53 added inline editing for
-- two free-text identifier fields only; this closes the gap for every other
-- correctable field on an admission (name, father's name, CNIC, contact,
-- email, program, merit category/number), plus the ability to remove a
-- record outright (e.g. a duplicate or mistaken entry). Status, fee amounts,
-- registration_number, and shift/group/section keep their own dedicated,
-- more narrowly-scoped RPCs and are deliberately untouched here.

create or replace function edit_admission(
  p_admission_id uuid,
  p_full_name text,
  p_father_name text,
  p_cnic text,
  p_contact_number text,
  p_email text,
  p_program_id uuid,
  p_merit_category merit_category,
  p_merit_number int
)
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

  if trim(p_full_name) = '' then
    raise exception 'full_name_required';
  end if;

  update admissions
  set full_name = trim(p_full_name),
      father_name = nullif(trim(p_father_name), ''),
      cnic = nullif(trim(p_cnic), ''),
      contact_number = nullif(trim(p_contact_number), ''),
      email = nullif(trim(p_email), ''),
      program_id = p_program_id,
      merit_category = p_merit_category,
      merit_number = p_merit_number
  where id = p_admission_id
  returning * into v_admission;

  return v_admission;
end;
$$;

-- Deliberately allowed at any status (mirrors set_admission_identifiers,
-- §53) rather than gated to 'pending' — a mistaken entry can need
-- correcting or removing after the fact regardless of where it is in the
-- workflow. The one hard stop is a verified fee voucher: that represents
-- real money already collected, and this app's own convention (§50/§51)
-- is to never let a record with real payment history be silently
-- destroyed. An unpaid/canceled voucher isn't real payment history, so it
-- (and its components, via cascade) is cleared along with the admission.
create or replace function delete_admission(p_admission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admission admissions;
  v_has_verified_voucher boolean;
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

  select exists(
    select 1 from fee_vouchers where admission_id = p_admission_id and status = 'verified'
  ) into v_has_verified_voucher;
  if v_has_verified_voucher then
    raise exception 'cannot_delete_admission_with_verified_voucher';
  end if;

  delete from fee_vouchers where admission_id = p_admission_id;
  delete from admissions where id = p_admission_id;
end;
$$;
