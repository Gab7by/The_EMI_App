-- Backs the home screen's image slider with 6 fixed, admin-editable
-- slots. Each slot either holds an admin-uploaded image or is left null,
-- in which case the app shows its bundled default for that position - so
-- "not changed" always just means the same (default or previously
-- uploaded) image is still there. This is a singleton-per-position table:
-- the insert below seeds exactly 6 rows (positions 1-6) and RLS never
-- grants insert/delete, only update, so it can't drift into having more,
-- fewer, or duplicate positions.
-- Safe to paste and re-run: `if not exists` / `drop policy if exists` /
-- `on conflict do nothing` guard against clashes if this is run more than
-- once.
--
-- Assumes:
--   - profiles(id, role) with role in ('member', 'admin')

create table if not exists public.home_slider_images (
  position smallint primary key check (position between 1 and 6),
  image_url text,
  storage_path text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Seed the 6 positions if they don't already exist, each starting with no
-- custom image (null = "show the bundled default for this position").
insert into public.home_slider_images (position)
select p
from generate_series(1, 6) as p
where not exists (select 1 from public.home_slider_images where position = p);

alter table public.home_slider_images enable row level security;

-- Select: any signed-in user can read the slider slots.
drop policy if exists "Authenticated users can read home slider images" on public.home_slider_images;
create policy "Authenticated users can read home slider images"
on public.home_slider_images
for select
to authenticated
using (true);

-- Update: only admins may change a slot. No insert/delete policy is
-- granted to anyone (including admins) - all 6 positions exist forever,
-- so all edits go through update.
drop policy if exists "Admins can update home slider images" on public.home_slider_images;
create policy "Admins can update home slider images"
on public.home_slider_images
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

-- Storage bucket the uploaded images actually live in. Public so the app
-- can just use the plain public URL (same approach as this app's other
-- image buckets) - `public = true` only affects reading the file itself,
-- not uploading/deleting, which the two storage.objects policies below
-- still gate to admins.
insert into storage.buckets (id, name, public)
values ('home-slider-images', 'home-slider-images', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload home slider images" on storage.objects;
create policy "Admins can upload home slider images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'home-slider-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can delete home slider image files" on storage.objects;
create policy "Admins can delete home slider image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'home-slider-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
