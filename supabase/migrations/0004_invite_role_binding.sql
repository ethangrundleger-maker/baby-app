-- Bind role to invite code. The existing families.invite_code joins as 'parent';
-- a separate nanny_invite_code joins as 'nanny'. The /auth/callback handler
-- looks up which code matched and assigns role accordingly — it never trusts
-- a user-supplied role from the magic-link URL.

alter table families
  add column if not exists nanny_invite_code text;

create unique index if not exists families_nanny_invite_unique
  on families(nanny_invite_code)
  where nanny_invite_code is not null;
