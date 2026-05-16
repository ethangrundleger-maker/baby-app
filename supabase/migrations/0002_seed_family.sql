-- One-time seed: create the family + child.
-- BEFORE RUNNING: replace BOTH instances of 'REPLACE_ME_INVITE' below with the
-- value you'll set as FAMILY_INVITE_CODE in your env (any string).
-- The app refuses to honor the literal value 'changeme' as a safety check.

insert into families (name, timezone, invite_code)
values ('Our Family', 'America/New_York', 'REPLACE_ME_INVITE')
on conflict (invite_code) do nothing;

insert into children (family_id, name, dob, notes)
select id, 'James', date '2025-11-30',
       'Mix of breast (~80%) and bottle (~20-30%). Starting solids this week (ped approved). Acid reflux — nighttime reflux medication.'
from families where invite_code = 'REPLACE_ME_INVITE'
  and not exists (
    select 1 from children c where c.family_id = families.id and c.name = 'James'
  );
