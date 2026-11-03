-- Security patch: prevent nickname impersonation via the presence heartbeat.
--
-- Found by testing: the anon key (public, bundled in the browser JS) could
-- PATCH /church_presence for ANY session_id, not just the caller's own, and
-- overwrite that row's nickname. This let anyone rewrite what name shows in
-- "지금 접속 중" for another visitor, without needing to know anything secret
-- (tested: a plain curl PATCH with the public anon key changed another
-- session's displayed nickname).
--
-- This trigger makes nickname immutable after the row is first created:
-- any UPDATE (including the 20s heartbeat) keeps the original nickname no
-- matter what the request body says, so the impersonation path is closed
-- without needing real authentication.
--
-- Run this once in the Supabase SQL Editor, after sql/schema.sql.

create or replace function church_presence_lock_nickname()
returns trigger as $$
begin
  new.nickname := old.nickname;
  return new;
end;
$$ language plpgsql;

drop trigger if exists church_presence_lock_nickname_trg on church_presence;

create trigger church_presence_lock_nickname_trg
before update on church_presence
for each row execute function church_presence_lock_nickname();
