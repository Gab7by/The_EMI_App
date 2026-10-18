# Approved Access Changes - Guest Data Access (Task 02)

**Approved by human on:** 2026-10-18

---

## Items to OPEN to Anonymous (SELECT only)

| # | Target | Current Policy | New Policy | Row Filter | Reason |
|---|--------|----------------|------------|------------|--------|
| 1 | `featured_teaching` table | `to authenticated using (true)` | `to public using (true)` | All rows (singleton) | Home screen featured teaching card |
| 2 | `home_slider_images` table | `to authenticated using (true)` | `to public using (true)` | All 6 positions | Home screen image slider |
| 3 | `testimonies` table | `to authenticated using (true)` | `to public using (true)` | **All rows** (no approval flag yet; future: add `is_approved` filter) | Home recent testimonies + testimonies list |
| 4 | `testimony_comments` table | `to authenticated using (true)` | `to public using (true)` | All rows | Testimony detail view comments |
| 5 | `testimony_images` table | `to authenticated using (true)` | `to public using (true)` | All rows | Testimony detail view images |
| 6 | `podcast_recordings` table | `to public using (EXISTS profiles WHERE id=auth.uid())` — effectively authenticated | **Add new policy:** `to public using (publish = true AND live_podcasts.status = 'completed')` | Only published, completed recordings | Library screen for guests |
| 7 | `recordings` storage bucket | Private bucket, policy requires authenticated | **Option B:** New edge function `get-recording-url` with `verify_jwt: false` that checks `podcast_recordings.publish=true` before generating signed URL | Only published recordings | Library playback for guests |

---

## Items to KEEP CLOSED to Anonymous (verify current state)

| # | Target | Current State | Action |
|---|--------|---------------|--------|
| 1 | `live_podcasts` table | Policy `"Public can read basic session info"` → `to public using (is_public=true AND status='live')` — **PARTIALLY OPEN** | **Keep as-is** — guests can READ public+listed live podcasts, but CANNOT JOIN (token requires auth) |
| 2 | `live_podcast_participants` table | `to public using (auth.uid() IS NOT NULL)` — effectively authenticated | No change — stay closed |
| 3 | `live_podcast_messages` table | `to public using (auth.uid() IS NOT NULL)` — effectively authenticated | No change — stay closed |
| 4 | `livekit-token` edge function | `verify_jwt: true` — requires auth | No change — stay closed |
| 5 | `livekit-close-room` edge function | `verify_jwt: true` — requires auth | No change — stay closed |
| 6 | `music_tracks` table | `to public using (auth.uid() IS NOT NULL)` — effectively authenticated | No change — stay closed (members only) |
| 7 | `music` storage bucket | Public bucket but admin-only upload | No change — stay as-is |

---

## Items ALREADY OPEN (no action needed)

| # | Target | Current Policy |
|---|--------|----------------|
| 1 | `profiles` table | `to public using (true)` — **Keep open** (needed for testimony author display) |
| 2 | `avatars` storage bucket | `to public` — Keep open |
| 3 | `podcast-covers` storage bucket | `to public` — Keep open |
| 4 | `home-slider-images` storage bucket | `to public` — Keep open |
| 5 | `testimony-images` storage bucket | `to public` — Keep open |
| 6 | `music` storage bucket | `to public` — Keep open |

---

## Deferred to Future (see future-decisions.md)

- Testimonies approval/moderation system (add `is_approved` column)
- Recordings storage bucket: Option A (make public) vs Option C (members only)
- Podcast recordings: public vs member-only visibility
- Profiles table: consider `public_profiles` view for anonymous joins