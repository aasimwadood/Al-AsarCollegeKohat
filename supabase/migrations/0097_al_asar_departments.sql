-- Al-Asar Degree College's three BS departments, as announced in the
-- prospectus ("Graduate Programs"): English, Psychology, Computer Science.
-- Codes are short because they appear in student registration numbers
-- (admit_student(), 0068). Descriptions are the prospectus's own framing
-- (lib/site/content/programs.ts). Idempotent: existing codes are skipped.
--
-- Shifts are deliberately not created — the prospectus describes none; the
-- administration can add them under Dashboard → Shifts if needed.
--
-- Also makes sure no government-network directorate remains: Al-Asar is a
-- private institution (0096 removes DHE-KP when unused; this repeats that
-- guard in case 0096 found it still referenced by something since removed).

insert into departments (name, code, college_id, description)
select v.name, v.code, c.id, v.description
from colleges c
cross join (values
  ('Department of English', 'ENG',
   'Language, literature and the confidence to communicate at every level. Offers BS English (4 years, 8 semesters).'),
  ('Department of Computer Science', 'CS',
   'Programming, systems and solution development for a technology-driven economy. Offers BS Computer Science (4 years, 8 semesters).'),
  ('Department of Psychology', 'PSY',
   'Understanding how people think, act and interact — the science of human behaviour. Offers BS Psychology (4 years, 8 semesters).')
) as v(name, code, description)
where c.slug = 'al-asar-degree-college'
on conflict (code) do nothing;

do $$
declare
  v_dir uuid;
begin
  select id into v_dir from directorates where code = 'DHE-KP';
  if v_dir is null then
    return;
  end if;
  if exists (select 1 from jmcs where directorate_id = v_dir)
     or exists (select 1 from profiles where directorate_id = v_dir) then
    raise notice 'DHE-KP directorate still in use; not removed';
    return;
  end if;
  delete from directorates where id = v_dir;
end $$;
