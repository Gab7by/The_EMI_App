-- Adds comments on testimonies: any authenticated user can read and post,
-- a comment's author may delete their own, and an admin may delete any.
-- Safe to paste and re-run: `if not exists` / `drop policy if exists`
-- guard against clashes if this is run more than once.
--
-- Assumes:
--   - testimonies(id)
--   - profiles(id, role) with role in ('member', 'admin')

create table if not exists public.testimony_comments (
  id uuid primary key default gen_random_uuid(),
  testimony_id uuid not null references public.testimonies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Comments are always fetched for one testimony, oldest first - this
-- covers that query directly instead of falling back to a full table scan.
create index if not exists testimony_comments_testimony_id_created_at_idx
  on public.testimony_comments (testimony_id, created_at);

alter table public.testimony_comments enable row level security;

-- Select: any signed-in user can read comments on any testimony.
drop policy if exists "Authenticated users can read testimony comments" on public.testimony_comments;
create policy "Authenticated users can read testimony comments"
on public.testimony_comments
for select
to authenticated
using (true);

-- Insert: a user may only post a comment as themselves.
drop policy if exists "Users can post their own testimony comments" on public.testimony_comments;
create policy "Users can post their own testimony comments"
on public.testimony_comments
for insert
to authenticated
with check (auth.uid() = user_id);

-- Delete: the comment's author, or an admin, may delete it.
drop policy if exists "Users can delete own testimony comments, admins any" on public.testimony_comments;
create policy "Users can delete own testimony comments, admins any"
on public.testimony_comments
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
