-- Multi-family + admin support.
--
-- 1. children.dob is now optional. The original schema required it but the
--    admin "add baby" form should not block on DOB — parents can backfill it
--    in Settings. Existing rows keep their values.
-- 2. Seed a second family for the nanny share (Nico). The existing family
--    from 0002 keeps James; the admin UI lets you rename it.
-- 3. Admin gating is handled via auth.users.app_metadata.is_admin (set by
--    service role only). No schema change needed for that — documented in
--    the PR.

alter table children alter column dob drop not null;

-- Seed Nico's family + Nico child. Idempotent on family name.
insert into families (name, timezone, invite_code, nanny_invite_code)
select 'Nico''s family', 'America/New_York',
       encode(gen_random_bytes(6), 'hex'),
       encode(gen_random_bytes(6), 'hex')
where not exists (select 1 from families where name = 'Nico''s family');

insert into children (family_id, name)
select f.id, 'Nico' from families f
where f.name = 'Nico''s family'
  and not exists (
    select 1 from children c where c.family_id = f.id and c.name = 'Nico'
  );
