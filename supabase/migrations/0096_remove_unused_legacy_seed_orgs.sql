-- Al-Asar database clean-up: earlier migrations (0028, 0072, 0074) seed the
-- JMC network's own organisation rows — "Directorate of Higher Education, KP"
-- (DHE-KP), "JMC Kohat" (JMC-KOH), "Government Postgraduate College Kohat"
-- (GPGC-KOH), its Morning/Evening shifts and its "Intermediate" department.
-- Later migrations need those rows to exist while they run, but they have no
-- place in Al-Asar Degree College's database.
--
-- Guarded, so it only ever removes rows that are demonstrably unused:
--   * does nothing unless the Al-Asar college row (0095) exists;
--   * does nothing if GPGC-KOH (or its departments/shifts) is referenced by
--     any profile, admission, recruitment advertisement, bank account or any
--     department other than the seeded Intermediate one.
-- Public-content rows scoped to GPGC-KOH cascade with it (0042); none are
-- seeded. The JMC and directorate rows are removed only if nothing else
-- belongs to them.

do $$
declare
  v_gpgc uuid;
  v_in_dept uuid;
  v_jmc uuid;
  v_dir uuid;
begin
  if not exists (select 1 from colleges where slug = 'al-asar-degree-college') then
    raise notice 'Al-Asar college row missing; skipping legacy clean-up';
    return;
  end if;

  select id, jmc_id into v_gpgc, v_jmc from colleges where code = 'GPGC-KOH';
  if v_gpgc is null then
    return;
  end if;
  select id into v_in_dept from departments where college_id = v_gpgc and code = 'IN';

  if exists (select 1 from profiles where college_id = v_gpgc or department_id = v_in_dept
               or shift_id in (select id from shifts where college_id = v_gpgc))
     or exists (select 1 from admissions where department_id = v_in_dept
               or shift_id in (select id from shifts where college_id = v_gpgc))
     or exists (select 1 from departments where college_id = v_gpgc and id is distinct from v_in_dept)
     or exists (select 1 from recruitment_advertisements where college_id = v_gpgc)
     or exists (select 1 from college_bank_accounts where college_id = v_gpgc)
  then
    raise notice 'GPGC-KOH is in use; leaving legacy organisation rows untouched';
    return;
  end if;

  delete from shifts where college_id = v_gpgc;
  if v_in_dept is not null then
    delete from departments where id = v_in_dept;
  end if;
  delete from colleges where id = v_gpgc;

  if not exists (select 1 from colleges where jmc_id = v_jmc)
     and not exists (select 1 from profiles where jmc_id = v_jmc) then
    select directorate_id into v_dir from jmcs where id = v_jmc;
    delete from jmcs where id = v_jmc;

    if v_dir is not null
       and not exists (select 1 from jmcs where directorate_id = v_dir)
       and not exists (select 1 from profiles where directorate_id = v_dir) then
      delete from directorates where id = v_dir;
    end if;
  end if;
end $$;
