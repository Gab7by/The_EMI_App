-- Migration: 20261018120000_guest_read_access_public_tables.sql
-- Purpose: Grant anonymous (public role) SELECT access to tables needed by guest-accessible tabs
-- Tables: featured_teaching, home_slider_images, testimonies, testimony_comments, testimony_images
-- All grants are SELECT only, no write access.
-- Rollback: Drop each policy listed below.

-- ============================================================
-- 1. featured_teaching - Home screen featured teaching card
-- ============================================================
-- Current: "Authenticated users can read featured teaching" (to authenticated)
-- New: Allow anonymous read (singleton table, always exactly one row)
drop policy if exists "Anonymous can read featured teaching" on public.featured_teaching;
create policy "Anonymous can read featured teaching"
on public.featured_teaching
for select
to public
using (true);

-- Rollback:
-- drop policy if exists "Anonymous can read featured teaching" on public.featured_teaching;


-- ============================================================
-- 2. home_slider_images - Home screen image slider (6 fixed positions)
-- ============================================================
-- Current: "Authenticated users can read home slider images" (to authenticated)
-- New: Allow anonymous read (6 seeded rows, position 1-6)
drop policy if exists "Anonymous can read home slider images" on public.home_slider_images;
create policy "Anonymous can read home slider images"
on public.home_slider_images
for select
to public
using (true);

-- Rollback:
-- drop policy if exists "Anonymous can read home slider images" on public.home_slider_images;


-- ============================================================
-- 3. testimonies - Home recent testimonies + testimonies list screen
-- ============================================================
-- Current: "Anyone authenticated can view testimonies" (to authenticated)
-- New: Allow anonymous read of ALL testimonies
-- NOTE: No approval flag exists yet. Future task will add is_approved column
-- and change this to: using (is_approved = true)
drop policy if exists "Anonymous can read testimonies" on public.testimonies;
create policy "Anonymous can read testimonies"
on public.testimonies
for select
to public
using (true);

-- Rollback:
-- drop policy if exists "Anonymous can read testimonies" on public.testimonies;


-- ============================================================
-- 4. testimony_comments - Testimony detail view comments
-- ============================================================
-- Current: "Authenticated users can read testimony comments" (to authenticated)
-- New: Allow anonymous read
drop policy if exists "Anonymous can read testimony comments" on public.testimony_comments;
create policy "Anonymous can read testimony comments"
on public.testimony_comments
for select
to public
using (true);

-- Rollback:
-- drop policy if exists "Anonymous can read testimony comments" on public.testimony_comments;


-- ============================================================
-- 5. testimony_images - Testimony detail view images
-- ============================================================
-- Current: "Anyone authenticated can view testimony images" (to authenticated)
-- New: Allow anonymous read
drop policy if exists "Anonymous can read testimony images" on public.testimony_images;
create policy "Anonymous can read testimony images"
on public.testimony_images
for select
to public
using (true);

-- Rollback:
-- drop policy if exists "Anonymous can read testimony images" on public.testimony_images;