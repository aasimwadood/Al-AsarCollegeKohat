-- Al-Asar Degree College public website: the institution's own `colleges`
-- row, so admin-managed public content (site_settings, portal_news,
-- faculty_directory, program_fees, downloads, important_dates …, all scoped
-- by college_id since 0042) has a college to belong to. The public site
-- finds it by slug (lib/site/config.ts → NEXT_PUBLIC_SITE_COLLEGE_SLUG).
--
-- Additive and idempotent: inserts only rows that don't already exist and
-- touches no existing row, column or policy. Run it against the Al-Asar
-- Supabase project — NOT against another institution's database.
--
-- The HED hierarchy (0027) requires every college to sit under a
-- directorate and a JMC-level body. Al-Asar is not part of the government
-- HED network, so its own parent bodies take those two slots:
-- Al-Asar Welfare Society (directorate level) → Al-Asar Academy (JMC level).
--
-- Only facts from the college prospectus are recorded. Contact number and
-- email are deliberately left NULL; the administration enters them under
-- Dashboard → System Settings.

insert into college_types (code, name)
values ('PDC', 'Private Degree College')
on conflict (code) do nothing;

do $$
declare
  v_directorate_id uuid;
  v_jmc_id uuid;
  v_type_id uuid;
begin
  if exists (select 1 from colleges where slug = 'al-asar-degree-college') then
    return;
  end if;

  select id into v_directorate_id from directorates where code = 'AWS';
  if v_directorate_id is null then
    insert into directorates (name, code, status)
    values ('Al-Asar Welfare Society', 'AWS', 'active')
    returning id into v_directorate_id;
  end if;

  select id into v_jmc_id from jmcs where code = 'AAA-KOH';
  if v_jmc_id is null then
    insert into jmcs (directorate_id, name, code, district, address, status)
    values (v_directorate_id, 'Al-Asar Academy', 'AAA-KOH', 'Kohat', 'Usterzai Payan, Kohat', 'active')
    returning id into v_jmc_id;
  end if;

  select id into v_type_id from college_types where code = 'PDC';

  insert into colleges (jmc_id, college_type_id, name, code, slug, district, address, principal_name, status)
  values (
    v_jmc_id,
    v_type_id,
    'Al-Asar Degree College',
    'ADC-KOH',
    'al-asar-degree-college',
    'Kohat',
    'Usterzai Payan, Kohat, Khyber Pakhtunkhwa',
    'Prof. Zafrullah Khan Wazir',
    'active'
  );
end $$;
