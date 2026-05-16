-- One-time seed: create the family + child.
-- BEFORE RUNNING: replace BOTH placeholder values below.
--   REPLACE_ME_PARENT_INVITE  -- the code parents will use; role = parent.
--   REPLACE_ME_NANNY_INVITE   -- the code the nanny will use; role = nanny.
-- Role is bound to which code matched at sign-in; the app does NOT trust any
-- role supplied by the caller. The literal value 'changeme' is refused as a
-- safety check.
-- NOTE: 0004_invite_role_binding.sql must already have been applied.

insert into families (name, timezone, invite_code, nanny_invite_code)
values ('Our Family', 'America/New_York', 'REPLACE_ME_PARENT_INVITE', 'REPLACE_ME_NANNY_INVITE')
on conflict (invite_code) do nothing;

insert into children (family_id, name, dob, notes)
select id, 'James', date '2025-11-30',
       'Mix of breast (~80%) and bottle (~20-30%). Starting solids this week (ped approved). Acid reflux — nighttime reflux medication.'
from families where invite_code = 'REPLACE_ME_PARENT_INVITE'
  and not exists (
    select 1 from children c where c.family_id = families.id and c.name = 'James'
  );
