-- enable useful extensions ---------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-------------------------------------------------------------------------------
-- 1. USERS
-------------------------------------------------------------------------------
create table public.users (
  id            uuid    primary key default gen_random_uuid(),
  author_name   text    unique not null,
  email         text,
  avatar_url    text,
  plan          text    default 'free',        -- 'free' | 'pro' | etc.
  tokens_used   int     default 0,
  created_at    timestamptz default now()
);

alter table public.users enable row level security;

create policy "users: Self-select"
  on public.users for select
  using ( auth.uid() = id );

create policy "users: Self-update"
  on public.users for update
  using ( auth.uid() = id );

-------------------------------------------------------------------------------
-- 2. REPOSITORIES the user opted into
-------------------------------------------------------------------------------
create table public.repos (
  id            uuid    primary key default gen_random_uuid(),
  user_id       uuid    not null references public.users on delete cascade,
  full_name     text    not null,               -- 'owner/repo'
  selected      bool    default false,
  bot_enabled   bool    default false,
  last_enabled  timestamptz default now(),

  constraint repos_unique_user_repo unique (user_id, full_name)
);

alter table public.repos enable row level security;

create policy "repos: owner select"
  on public.repos for select
  using ( auth.uid() = user_id );

create policy "repos: owner insert"
  on public.repos for insert
  with check ( auth.uid() = user_id );

create policy "repos: owner update"
  on public.repos for update
  using ( auth.uid() = user_id );

create policy "repos: owner delete"
  on public.repos for delete
  using ( auth.uid() = user_id );

-------------------------------------------------------------------------------
-- 2b. REPO CONNECTIONS  (new)
-- a many-to-many list of "other repos that interact with this repo"
-------------------------------------------------------------------------------
create table public.repo_connections (
  id              uuid primary key default gen_random_uuid(),
  repo_id         uuid not null references public.repos on delete cascade,
  connected_name  text not null,               -- 'owner/otherRepo'
  note            text,
  created_at      timestamptz default now(),

  constraint uniq_repo_conn unique (repo_id, connected_name)
);

alter table public.repo_connections enable row level security;

create policy "conn: owner select"
  on public.repo_connections for select
  using (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

create policy "conn: owner insert"
  on public.repo_connections for insert
  with check (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

create policy "conn: owner delete"
  on public.repo_connections for delete
  using (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

-------------------------------------------------------------------------------
-- 3. TOKEN USAGE  (billing / quota)
-------------------------------------------------------------------------------
create table public.token_usage (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    not null references public.users on delete cascade,
  repo_id     uuid    not null references public.repos on delete cascade,
  bot         text    not null,                -- 'pr-review' | 'unit-test'
  tokens      int     not null,
  run_at      timestamptz default now()
);

alter table public.token_usage enable row level security;

create policy "usage: owner select"
  on public.token_usage for select
  using ( auth.uid() = user_id );

-- (service-role key bypasses RLS for inserts)

-------------------------------------------------------------------------------
-- 4. BOT SETTINGS  (optional JSON rules per repo)
-------------------------------------------------------------------------------
create table public.bot_settings (
  repo_id     uuid primary key references public.repos on delete cascade,
  rules       jsonb default '{}'
);

alter table public.bot_settings enable row level security;

create policy "bot_settings: owner select"
  on public.bot_settings for select
  using (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

create policy "bot_settings: owner insert"
  on public.bot_settings for insert
  with check (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

create policy "bot_settings: owner update"
  on public.bot_settings for update
  using (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

create policy "bot_settings: owner delete"
  on public.bot_settings for delete
  using (
    auth.uid() = (select user_id from public.repos where id = repo_id)
  );

-------------------------------------------------------------------------------
-- 5. HELPER FUNCTION: total tokens in a date range
-------------------------------------------------------------------------------
create or replace function public.total_tokens(
  uid uuid,
  from_ts timestamptz,
  to_ts   timestamptz default now()
) returns int
language sql stable as $$
  select coalesce(sum(tokens),0)
  from public.token_usage
  where user_id = uid
    and run_at >= from_ts
    and run_at <  to_ts;
$$;
