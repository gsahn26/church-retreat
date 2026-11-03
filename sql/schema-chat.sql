-- Run this once in the Supabase SQL Editor, after sql/schema.sql and
-- sql/security-patch-01.sql. Adds the "예배 채팅" (worship chat) table used by
-- the 실시간 예배 panel, and turns on Realtime for it so messages appear
-- live for everyone watching, without polling.

create table if not exists church_chat (
  id bigint generated always as identity primary key,
  nickname text not null,
  message text not null check (char_length(message) <= 200),
  created_at timestamptz not null default now()
);

alter table church_chat enable row level security;

create policy "anon can read chat"
  on church_chat for select
  to anon
  using (true);

create policy "anon can send chat"
  on church_chat for insert
  to anon
  with check (char_length(message) > 0 and char_length(message) <= 200);

-- Messages are never editable or deletable via the anon key (no update/delete
-- policy), so once sent a message can't be changed or removed by visitors.

-- Enable Realtime so INSERTs are pushed to subscribers immediately.
alter publication supabase_realtime add table church_chat;
