-- Internship workflow update, step 1 of 2: add the new role value in its
-- own transaction. A value added via ALTER TYPE ... ADD VALUE can't be
-- referenced by any policy/function created in the same transaction
-- (precedent: 0026, 0073) — 0091 (schema/RLS/RPCs) depends on this having
-- already committed.
alter type user_role add value 'site_supervisor';
