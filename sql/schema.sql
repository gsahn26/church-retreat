-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Creates the two tables church-retreat's "접속자 목록 / 내 접속 이력" feature uses.
-- Table names are prefixed with church_ so they don't collide with the LMS
-- project's tables in the same Supabase project.

create table if not exists church_visits (
  id bigint generated always as identity primary key,
  nickname text not null,
  session_id text,
  visited_at timestamptz not null default now()
);

alter table church_visits enable row level security;

create policy "anon can insert visits"
  on church_visits for insert
  to anon
  with check (true);

create policy "anon can read visits"
  on church_visits for select
  to anon
  using (true);

create table if not exists church_presence (
  session_id text primary key,
  nickname text not null,
  last_seen timestamptz not null default now()
);

alter table church_presence enable row level security;

create policy "anon can upsert presence"
  on church_presence for insert
  to anon
  with check (true);

create policy "anon can update own presence row"
  on church_presence for update
  to anon
  using (true);

create policy "anon can read presence"
  on church_presence for select
  to anon
  using (true);
