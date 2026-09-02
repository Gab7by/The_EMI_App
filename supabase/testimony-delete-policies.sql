-- Lets a user delete their own testimony, and lets an admin delete anyone's.
-- Safe to paste and re-run: DROP POLICY IF EXISTS guards against a
-- name clash if a policy with the same name already exists.
--
-- Assumes:
--   - testimonies(id, user_id, content, created_at)
--   - testimony_images(id, testimony_id, image_url, created_at)
--   - profiles(id, role) with role in ('member', 'admin')
-- If your testimony_images FK column isn't named testimony_id, adjust the
-- second policy below to match.

alter table public.testimonies enable row level security;
alter table public.testimony_images enable row level security;

-- Testimonies: owner or admin may delete.
drop policy if exists "Users can delete own testimonies, admins any" on public.testimonies;
create policy "Users can delete own testimonies, admins any"
on public.testimonies
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

-- Testimony images: same rule, checked against the parent testimony's owner
-- (this table has no user_id of its own).
drop policy if exists "Users can delete own testimony images, admins any" on public.testimony_images;
create policy "Users can delete own testimony images, admins any"
on public.testimony_images
for delete
to authenticated
using (
  exists (
    select 1 from public.testimonies
    where testimonies.id = testimony_images.testimony_id
      and (
        testimonies.user_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
      )
  )
);
