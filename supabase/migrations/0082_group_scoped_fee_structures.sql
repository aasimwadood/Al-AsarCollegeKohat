-- fee_structures (0061) is keyed only by program + semester + session — one
-- amount for everyone in that program/semester/session. Intermediate's
-- Groups (Pre-Medical/Pre-Engineering/Computer Science/Arts, 0074) need
-- different fees within the same program, so a group_id join is added.
--
-- A single 4-column unique constraint would silently allow duplicate
-- group_id IS NULL rows (Postgres treats NULLs as distinct from each
-- other), so BS-style ungrouped structures need their own partial unique
-- index rather than a wider single constraint — same pattern this codebase
-- already uses for scope-conditional uniqueness
-- (designation_assignments_college_scope_unique_idx /
-- ..._department_scope_unique_idx, 0056_proctorial_board.sql).

alter table fee_structures add column group_id uuid references groups (id) on delete cascade;

alter table fee_structures drop constraint fee_structures_program_id_semester_number_academic_session__key;

create unique index fee_structures_no_group_unique_idx on fee_structures (program_id, semester_number, academic_session_id) where group_id is null;
create unique index fee_structures_group_unique_idx on fee_structures (program_id, semester_number, academic_session_id, group_id) where group_id is not null;

-- upsert_fee_structure() (current source 0061): same body, branches the
-- insert on whether p_group_id is null so each branch targets its own
-- partial index (ON CONFLICT can't pick between two different partial
-- indexes in one static clause).
create or replace function upsert_fee_structure(
  p_program_id uuid,
  p_semester_number int,
  p_academic_session_id uuid,
  p_components jsonb,
  p_group_id uuid default null
)
returns fee_structures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_structure fee_structures;
  v_total numeric;
  v_component jsonb;
begin
  if current_user_role() = 'admin' then
    null;
  elsif current_user_role() = 'principal'
    and department_college_id((select department_id from programs where id = p_program_id)) = current_college_id() then
    null;
  else
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if p_components is null or jsonb_array_length(p_components) = 0 then
    raise exception 'at_least_one_component_required';
  end if;

  if p_group_id is not null and not exists (
    select 1 from groups g join programs p on p.department_id = g.department_id
    where g.id = p_group_id and p.id = p_program_id
  ) then
    raise exception 'group_not_in_program_department';
  end if;

  select coalesce(sum((c ->> 'amount')::numeric), 0) into v_total
  from jsonb_array_elements(p_components) c;

  if p_group_id is null then
    insert into fee_structures (program_id, semester_number, academic_session_id, group_id, status, total_amount, created_by)
    values (p_program_id, p_semester_number, p_academic_session_id, null, 'active', v_total, auth.uid())
    on conflict (program_id, semester_number, academic_session_id) where group_id is null
    do update set total_amount = excluded.total_amount, status = 'active', updated_at = now()
    returning * into v_structure;
  else
    insert into fee_structures (program_id, semester_number, academic_session_id, group_id, status, total_amount, created_by)
    values (p_program_id, p_semester_number, p_academic_session_id, p_group_id, 'active', v_total, auth.uid())
    on conflict (program_id, semester_number, academic_session_id, group_id) where group_id is not null
    do update set total_amount = excluded.total_amount, status = 'active', updated_at = now()
    returning * into v_structure;
  end if;

  delete from fee_structure_components where fee_structure_id = v_structure.id;

  for v_component in select * from jsonb_array_elements(p_components) loop
    insert into fee_structure_components (fee_structure_id, name, amount, sort_order)
    values (v_structure.id, v_component ->> 'name', (v_component ->> 'amount')::numeric,
      coalesce((v_component ->> 'sort_order')::int, 0));
  end loop;

  return v_structure;
end;
$$;

-- generate_fee_voucher() (current source 0076): resolve the student's own
-- group_id and require the matched structure's group_id to agree, using
-- IS NOT DISTINCT FROM so a BS student (group_id null) still matches an
-- ungrouped structure rather than needing a separate null-check branch.
create or replace function generate_fee_voucher(p_promotion_id uuid)
returns fee_vouchers
language plpgsql
security definer
set search_path = public
as $$
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
    'GPGC-FEE-' || v_year || '-' || lpad(v_seq::text, 4, '0'),
    p_promotion_id, v_promotion.student_profile_id, v_structure.id,
    v_structure.total_amount, 'unpaid', (now() + interval '14 days')::date, auth.uid()
  ) returning * into v_voucher;

  for v_component in select name, amount, sort_order from fee_structure_components where fee_structure_id = v_structure.id loop
    insert into fee_voucher_components (fee_voucher_id, name, amount, sort_order)
    values (v_voucher.id, v_component.name, v_component.amount, v_component.sort_order);
  end loop;

  return v_voucher;
end;
$$;

-- generate_admission_fee_voucher() (current source 0076): same group_id
-- matching, resolved from the admission's own group_id (set by
-- assign_admission_placement, 0075) rather than a profiles join since no
-- profile may exist yet for a pending admission.
create or replace function generate_admission_fee_voucher(p_admission_id uuid)
returns fee_vouchers
language plpgsql
security definer
set search_path = public
as $$
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
    'GPGC-FEE-' || v_year || '-' || lpad(v_seq::text, 4, '0'),
    p_admission_id, v_admission.student_profile_id, v_structure.id,
    v_structure.total_amount, 'unpaid', (now() + interval '14 days')::date, auth.uid()
  ) returning * into v_voucher;

  for v_component in select name, amount, sort_order from fee_structure_components where fee_structure_id = v_structure.id loop
    insert into fee_voucher_components (fee_voucher_id, name, amount, sort_order)
    values (v_voucher.id, v_component.name, v_component.amount, v_component.sort_order);
  end loop;

  return v_voucher;
end;
$$;
