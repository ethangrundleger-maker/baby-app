-- Defense-in-depth invariant: the nanny invite code must not equal the
-- parent invite code on the same family. Without this guard, a typo at seed
-- time would silently promote a nanny joiner to parent because the auth
-- callback checks the parent column first (round-3 P2-1).

alter table families
  drop constraint if exists nanny_code_differs_from_parent;

alter table families
  add constraint nanny_code_differs_from_parent
  check (nanny_invite_code is null or nanny_invite_code <> invite_code);
