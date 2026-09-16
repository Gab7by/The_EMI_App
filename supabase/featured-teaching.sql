-- Backs the home screen's "Featured Teaching" card with an admin-editable
-- daily devotional, structured into five sections: Title, Scripture
-- Reference, Devotional Message, Prayer, and Declaration. This is a
-- singleton: exactly one row always exists, and RLS never grants
-- insert/delete, only update, so "not changed" naturally means "the
-- previous one is still there" - there's nothing to fall back to, it just
-- never went away.
--
-- Safe to paste and re-run, and safe no matter which earlier version of
-- this table you're starting from - a brand new database, the original
-- single title/content version, or the four-section version that briefly
-- dropped title. Existing content is always migrated forward, never lost.
--
-- Assumes:
--   - profiles(id, role) with role in ('member', 'admin')

create table if not exists public.featured_teaching (
  id uuid primary key default gen_random_uuid(),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.featured_teaching add column if not exists title text;
alter table public.featured_teaching add column if not exists scripture_reference text;
alter table public.featured_teaching add column if not exists devotional_message text;
alter table public.featured_teaching add column if not exists prayer text;
alter table public.featured_teaching add column if not exists declaration text;

-- Migrate the original single title/content row (if this database still
-- has one) onto the new columns before dropping content - title is kept
-- as-is this time. Only runs once: content is gone after, so this is a
-- no-op on a re-run.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'featured_teaching' and column_name = 'content'
  ) then
    update public.featured_teaching
    set devotional_message = coalesce(nullif(devotional_message, ''), content);

    alter table public.featured_teaching drop column content;
  end if;
end $$;

-- Fills in placeholder text for any section still empty after the above -
-- covers a table that already had the four-section columns from a
-- previous run of this file, but no title (it was dropped, then re-added
-- above as null). Never overwrites real content: coalesce/nullif only
-- touches a column that's still null or ''.
update public.featured_teaching
set
  title = coalesce(nullif(title, ''), 'A Word For You Today'),
  scripture_reference = coalesce(nullif(scripture_reference, ''), 'Romans 8:28 - And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'),
  devotional_message = coalesce(nullif(devotional_message, ''), 'Check back soon for today''s devotional message.'),
  prayer = coalesce(nullif(prayer, ''), 'Father, thank You for Your word today. Help us to walk in what You have spoken over us, in Jesus'' name. Amen.'),
  declaration = coalesce(nullif(declaration, ''), 'I declare that I am who God says I am, walking in the fullness of His purpose for my life.');

-- Seed exactly one row if the table is completely empty (a fresh install
-- that never had any earlier version of this feature), so the home
-- screen always has something to show even before an admin has published
-- anything.
insert into public.featured_teaching (title, scripture_reference, devotional_message, prayer, declaration)
select
  'A Word For You Today',
  'Romans 8:28 - And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  'Check back soon for today''s devotional message.',
  'Father, thank You for Your word today. Help us to walk in what You have spoken over us, in Jesus'' name. Amen.',
  'I declare that I am who God says I am, walking in the fullness of His purpose for my life.'
where not exists (select 1 from public.featured_teaching);

alter table public.featured_teaching
  alter column title set not null,
  alter column scripture_reference set not null,
  alter column devotional_message set not null,
  alter column prayer set not null,
  alter column declaration set not null;

alter table public.featured_teaching drop constraint if exists featured_teaching_title_check;
alter table public.featured_teaching add constraint featured_teaching_title_check
  check (char_length(trim(title)) > 0 and char_length(title) <= 120);

alter table public.featured_teaching drop constraint if exists featured_teaching_scripture_reference_check;
alter table public.featured_teaching add constraint featured_teaching_scripture_reference_check
  check (char_length(trim(scripture_reference)) > 0 and char_length(scripture_reference) <= 400);

alter table public.featured_teaching drop constraint if exists featured_teaching_devotional_message_check;
alter table public.featured_teaching add constraint featured_teaching_devotional_message_check
  check (char_length(trim(devotional_message)) > 0 and char_length(devotional_message) <= 4000);

alter table public.featured_teaching drop constraint if exists featured_teaching_prayer_check;
alter table public.featured_teaching add constraint featured_teaching_prayer_check
  check (char_length(trim(prayer)) > 0 and char_length(prayer) <= 1200);

alter table public.featured_teaching drop constraint if exists featured_teaching_declaration_check;
alter table public.featured_teaching add constraint featured_teaching_declaration_check
  check (char_length(trim(declaration)) > 0 and char_length(declaration) <= 800);

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
