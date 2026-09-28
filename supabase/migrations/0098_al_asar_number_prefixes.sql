-- Al-Asar numbering: student registration numbers and fee-voucher numbers
-- were generated with the previous institution's prefixes ("GPCK-" and
-- "GPGC-FEE-"). This re-creates the four generating functions exactly as
-- they are live (taken from pg_get_functiondef on this database after
-- 0001–0097), changing only the prefix:
--
--   registration number  GPCK-2026-ENG-001     ->  ADC-2026-ENG-001
--   fee voucher number   GPGC-FEE-2026-0001    ->  ADC-FEE-2026-0001
--
-- No application code parses these prefixes. Numbers already issued (none
-- at the time of writing) are not modified. CREATE OR REPLACE keeps the
-- functions' existing grants.

-- admit_student(uuid)
CREATE OR REPLACE FUNCTION public.admit_student(p_admission_id uuid)
 RETURNS admissions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_admission admissions;
  v_dept_code text;
  v_year int;
  v_seq int;
  v_semester_id uuid;
begin
  if current_user_role() not in ('admin', 'department', 'faculty', 'focal_person_intermediate') then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select * into v_admission from admissions where id = p_admission_id for update;
  if not found then
    raise exception 'admission_not_found';
  end if;

  if current_user_role() = 'admin' and department_college_id(v_admission.department_id) <> current_college_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  if current_user_role() in ('department', 'faculty', 'focal_person_intermediate')
     and v_admission.department_id <> current_department_id() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if v_admission.status <> 'fee_approved' then
    raise exception 'invalid_status: admission must be fee_approved to admit, got %', v_admission.status;
  end if;

  select code into v_dept_code from departments where id = v_admission.department_id;
  v_year := extract(year from now())::int;

  insert into registration_counters (department_id, academic_year, last_seq)
  values (v_admission.department_id, v_year, 1)
  on conflict (department_id, academic_year)
  do update set last_seq = registration_counters.last_seq + 1
  returning last_seq into v_seq;

  select s.id into v_semester_id from semesters s
    join academic_sessions a on a.id = s.academic_session_id
    where a.is_active = true and s.number = 1
    limit 1;

  update admissions
  set status = 'admitted',
      registration_number = 'ADC-' || v_year || '-' || upper(v_dept_code) || '-' || lpad(v_seq::text, 3, '0'),
      semester_id = v_semester_id,
      approved_by = auth.uid(),
      approved_at = now()
  where id = p_admission_id
  returning * into v_admission;

  return v_admission;
end;
$function$;

-- generate_fee_voucher(uuid)
CREATE OR REPLACE FUNCTION public.generate_fee_voucher(p_promotion_id uuid)
 RETURNS fee_vouchers
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_promotion promotions;
  v_program_id uuid;
  v_student_group_id uuid;
  v_semester_number int;
  v_academic_session_id uuid;
  v_structure fee_structures;
  v_voucher fee_vouchers;
  v_year int;
  v_seq int;
  v_component record;
begin
  select * into v_promotion from promotions where id = p_promotion_id for update;
  if not found then
    raise exception 'promotion_not_found';
  end if;

  if v_promotion.student_profile_id <> auth.uid() then
    if current_user_role() = 'admin' then
      if profile_college_id(v_promotion.student_profile_id) <> current_college_id() then
        raise exception 'insufficient_privilege' using errcode = '42501';
      end if;
    elsif current_user_role() in ('department', 'focal_person_intermediate') then
      if (select department_id from profiles where id = v_promotion.student_profile_id) <> current_department_id() then
        raise exception 'insufficient_privilege' using errcode = '42501';
      end if;
    else
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  end if;

  if v_promotion.status <> 'fee_pending' then
    raise exception 'invalid_status: promotion must be fee_pending, got %', v_promotion.status;
  end if;

  select program_id, group_id into v_program_id, v_student_group_id from profiles where id = v_promotion.student_profile_id;

  select s.number, s.academic_session_id into v_semester_number, v_academic_session_id
  from semesters s where s.id = v_promotion.to_semester_id;

  select * into v_structure from fee_structures
  where program_id = v_program_id
    and semester_number = v_semester_number
    and academic_session_id = v_academic_session_id
    and status = 'active'
    and group_id is not distinct from v_student_group_id;
  if not found then
    raise exception 'no_fee_structure_configured';
  end if;

  v_year := extract(year from now())::int;
  insert into fee_voucher_counters (academic_year, last_seq)
  values (v_year, 1)
  on conflict (academic_year)
  do update set last_seq = fee_voucher_counters.last_seq + 1
  returning last_seq into v_seq;

  insert into fee_vouchers (
    voucher_number, promotion_id, student_profile_id, fee_structure_id,
    total_amount, status, due_date, generated_by
  ) values (
    'ADC-FEE-' || v_year || '-' || lpad(v_seq::text, 4, '0'),
    p_promotion_id, v_promotion.student_profile_id, v_structure.id,
    v_structure.total_amount, 'unpaid', (now() + interval '14 days')::date, auth.uid()
  ) returning * into v_voucher;

  for v_component in select name, amount, sort_order from fee_structure_components where fee_structure_id = v_structure.id loop
    insert into fee_voucher_components (fee_voucher_id, name, amount, sort_order)
    values (v_voucher.id, v_component.name, v_component.amount, v_component.sort_order);
  end loop;

  return v_voucher;
end;
$function$;

-- generate_admission_fee_voucher(uuid)
CREATE OR REPLACE FUNCTION public.generate_admission_fee_voucher(p_admission_id uuid)
 RETURNS fee_vouchers
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_admission admissions;
  v_semester_id uuid;
  v_academic_session_id uuid;
  v_structure fee_structures;
  v_voucher fee_vouchers;
  v_year int;
  v_seq int;
  v_component record;
begin
  select * into v_admission from admissions where id = p_admission_id for update;
  if not found then
    raise exception 'admission_not_found';
  end if;

  if current_user_role() = 'admin' then
    if department_college_id(v_admission.department_id) <> current_college_id() then
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  elsif current_user_role() in ('department', 'faculty', 'focal_person_intermediate') then
    if v_admission.department_id <> current_department_id() then
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  else
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if v_admission.status <> 'pending' then
    raise exception 'invalid_status: admission must be pending, got %', v_admission.status;
  end if;
  if v_admission.program_id is null then
    raise exception 'admission_has_no_program_assigned';
  end if;

  select s.id, s.academic_session_id into v_semester_id, v_academic_session_id
  from semesters s join academic_sessions a on a.id = s.academic_session_id
  where a.is_active = true and s.number = 1
  limit 1;
  if v_semester_id is null then
    raise exception 'no_active_semester_one';
  end if;

  select * into v_structure from fee_structures
  where program_id = v_admission.program_id
    and semester_number = 1
    and academic_session_id = v_academic_session_id
    and status = 'active'
    and group_id is not distinct from v_admission.group_id;
  if not found then
    raise exception 'no_fee_structure_configured';
  end if;

  v_year := extract(year from now())::int;
  insert into fee_voucher_counters (academic_year, last_seq)
  values (v_year, 1)
  on conflict (academic_year)
  do update set last_seq = fee_voucher_counters.last_seq + 1
  returning last_seq into v_seq;

  insert into fee_vouchers (
    voucher_number, admission_id, student_profile_id, fee_structure_id,
    total_amount, status, due_date, generated_by
  ) values (
    'ADC-FEE-' || v_year || '-' || lpad(v_seq::text, 4, '0'),
    p_admission_id, v_admission.student_profile_id, v_structure.id,
    v_structure.total_amount, 'unpaid', (now() + interval '14 days')::date, auth.uid()
  ) returning * into v_voucher;

  for v_component in select name, amount, sort_order from fee_structure_components where fee_structure_id = v_structure.id loop
    insert into fee_voucher_components (fee_voucher_id, name, amount, sort_order)
    values (v_voucher.id, v_component.name, v_component.amount, v_component.sort_order);
  end loop;

  return v_voucher;
end;
$function$;

-- generate_custom_fee_voucher(uuid,text,jsonb)
CREATE OR REPLACE FUNCTION public.generate_custom_fee_voucher(p_student_profile_id uuid, p_reason text, p_components jsonb)
 RETURNS fee_vouchers
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_voucher fee_vouchers;
  v_total numeric;
  v_year int;
  v_seq int;
  v_component jsonb;
begin
  if current_user_role() = 'admin' then
    if profile_college_id(p_student_profile_id) <> current_college_id() then
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  elsif current_user_role() = 'administration' then
    if profile_college_id(p_student_profile_id) <> current_college_id() then
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  elsif current_user_role() in ('department', 'focal_person_intermediate') then
    if (select department_id from profiles where id = p_student_profile_id) <> current_department_id() then
      raise exception 'insufficient_privilege' using errcode = '42501';
    end if;
  else
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason_required';
  end if;
  if p_components is null or jsonb_array_length(p_components) = 0 then
    raise exception 'at_least_one_component_required';
  end if;

  select coalesce(sum((c ->> 'amount')::numeric), 0) into v_total
  from jsonb_array_elements(p_components) c;

  v_year := extract(year from now())::int;
  insert into fee_voucher_counters (academic_year, last_seq)
  values (v_year, 1)
  on conflict (academic_year)
  do update set last_seq = fee_voucher_counters.last_seq + 1
  returning last_seq into v_seq;

  insert into fee_vouchers (
    voucher_number, student_profile_id, is_custom, custom_reason,
    total_amount, status, due_date, generated_by
  ) values (
    'ADC-FEE-' || v_year || '-' || lpad(v_seq::text, 4, '0'),
    p_student_profile_id, true, p_reason,
    v_total, 'unpaid', (now() + interval '14 days')::date, auth.uid()
  ) returning * into v_voucher;

  for v_component in select * from jsonb_array_elements(p_components) loop
    insert into fee_voucher_components (fee_voucher_id, name, amount, sort_order)
    values (v_voucher.id, v_component ->> 'name', (v_component ->> 'amount')::numeric,
      coalesce((v_component ->> 'sort_order')::int, 0));
  end loop;

  return v_voucher;
end;
$function$;
