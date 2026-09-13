-- Backs the home screen's "Featured teaching" card with an admin-editable
-- daily devotion. This is a singleton: exactly one row always exists (the
-- insert below seeds it, and no insert/delete policy is ever granted, only
-- update), so "not changed" naturally means "the previous one is still
-- there" - there's nothing to fall back to, it just never went away.
-- Safe to paste and re-run: `if not exists` / `drop policy if exists`
-- guard against clashes if this is run more than once.
--
-- Assumes:
--   - profiles(id, role) with role in ('member', 'admin')

create table if not exists public.featured_teaching (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 4000),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Seed exactly one row if the table is empty, so the home screen always has
-- something to show even before an admin has posted anything.
insert into public.featured_teaching (title, content)
select
  'Manifestation Of The Sons of God',
  'Raising mature sons for Kingdom dominion.'
where not exists (select 1 from public.featured_teaching);

alter table public.featured_teaching enable row level security;

-- Select: any signed-in user can read the featured teaching.
drop policy if exists "Authenticated users can read featured teaching" on public.featured_teaching;
create policy "Authenticated users can read featured teaching"
on public.featured_teaching
for select
to authenticated
using (true);

-- Update: only admins may edit it. No insert/delete policy is granted to
-- anyone (including admins) - the row count is meant to stay at exactly
-- one forever, so all edits go through update.
drop policy if exists "Admins can update featured teaching" on public.featured_teaching;
create policy "Admins can update featured teaching"
on public.featured_teaching
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
