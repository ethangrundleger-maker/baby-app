-- One-time seed: create the family + child. Run after first auth user signs up.
-- Replace the invite code with whatever you set in FAMILY_INVITE_CODE.
-- This is idempotent.

insert into families (name, timezone, invite_code)
values ('Our Family', 'America/New_York', 'changeme')
on conflict (invite_code) do nothing;

insert into children (family_id, name, dob, notes)
select id, 'James', date '2025-11-30',
       'Mix of breast (~80%) and bottle (~20-30%). Starting solids this week (ped approved). Acid reflux — nighttime reflux medication.'
from families where invite_code = 'changeme'
  and not exists (
    select 1 from children c where c.family_id = families.id and c.name = 'James'
  );
