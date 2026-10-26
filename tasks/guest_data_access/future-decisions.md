# Future Decisions - Guest Data Access (Task 02)

Items deferred from the current task, to be revisited in a future task.

---

## 1. Testimonies Approval/Moderation System
**Status:** Deferred
**Current state:** `testimonies` table has no approval flag. All inserted testimonies are immediately visible.
**Decision needed:** 
- Add `is_approved` / `status` column to `testimonies` (e.g., `pending`, `approved`, `rejected`)
- Create admin moderation UI
- Anonymous reads should only see `approved` testimonies
- Authenticated users might see their own `pending` + all `approved`
**Current task approach:** Open `testimonies` SELECT to anonymous for all rows (admins can delete problematic ones). Revisit when moderation is built.

---

## 2. Profiles Table Anonymous Access
**Status:** Under discussion
**Current state:** Policy `"Anyone can read profiles"` → `to public` `using (true)` — fully open.
**Question:** Should this be restricted to `authenticated` only?
**Dependency:** `testimonies` SELECT joins `profiles(full_name, avatar_url)` for author display. If profiles becomes authenticated-only, anonymous testimony reads would fail the join or return null names/avatars.
**Options:**
- A) Keep profiles open to anonymous (simpler, exposes all user names/avatars)
- B) Restrict profiles to authenticated, create a `public_profiles` view with only `id, full_name, avatar_url` for anonymous joins
- C) Restrict profiles to authenticated, modify testimony queries to not join profiles for anonymous (show "Anonymous" or similar)
**Current task approach:** Keep profiles open to anonymous (A) — minimal exposure (name + avatar only), needed for testimony author display.

---

## 3. Music Tracks Access
**Status:** Decided — **authenticated only**
**Current state:** Policy `"Authenticated users can read music tracks"` → `to public` `using (auth.uid() IS NOT NULL)` — effectively authenticated-only.
**Decision:** Keep as authenticated-only. Guests do not need music tracks. Members (signed-in) need it for background music feature.
**Action:** No change needed.

---

## 4. Live Podcasts - Guest Read Access
**Status:** Decided — **allow read for public+listed live podcasts**
**Current state:** Policy `"Public can read basic session info"` → `to public` `using ((is_public = true) AND (status = 'live'))` — already allows anonymous read of live public+listed podcasts.
**Decision:** 
- Guests CAN read `live_podcasts` where `is_public=true AND is_unlisted=false AND status='live'`
- Guests CANNOT join/enter the live stream (token issuance requires auth via `livekit-token` edge function)
- UI will show the card but route to welcome/join screen on tap
**Action:** Keep existing policy. Verify `livekit-token` edge function blocks anonymous (it does: `verify_jwt: true`, requires auth).

---

## 5. Podcast Recordings - Guest Read Access
**Status:** In progress (this task) — **allow read for published recordings**
**Current state:** Policy `"Everyone can read recordings"` → `to public` but `using (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()))` — effectively authenticated-only.
**Decision:** 
- Add new policy for anonymous: SELECT where `publish=true` AND joined `live_podcasts.status='completed'`
- Signed-in members: existing policy (all recordings for admins, published for members)
**Future revisit:** 
- Consider if guests should see recording metadata at all, or only signed-in members
- Consider separate "public recordings" vs "member recordings" flag

---

## 6. Recordings Storage Bucket - Guest Access
**Status:** In progress (this task)
**Current state:** `recordings` bucket is `public=false`. Policy `"Every authenticated user can read recordings"` requires profile. Signed URLs generated via edge function (requires auth).
**Decision:** 
- Option A: Make bucket public, allow anonymous signed URL generation
- Option B: Keep private, create edge function `get-recording-url` with `verify_jwt: false` that checks `podcast_recordings.publish=true` before generating signed URL
- Option C: Keep private, only signed-in users can play recordings
**Current task approach:** Option B (new edge function without JWT verification, checks publish status). Revisit in future for Option A vs C.

---

## 7. Testimony Images Table - Guest Read Access
**Status:** Decided — **allow read for anonymous**
**Current state:** Policy `"Anyone authenticated can view testimony images"` → `to authenticated` — closed to anonymous.
**Decision:** Add anonymous SELECT policy. Needed for testimony detail view to show images.
**Action:** Add policy `to public using (true)`.

---

## 8. Testimony Comments - Guest Read Access
**Status:** In progress (this task)
**Current state:** Policy `"Authenticated users can read testimony comments"` → `to authenticated` — closed to anonymous.
**Decision:** Add anonymous SELECT policy. Needed for testimony detail view.
**Action:** Add policy `to public using (true)`.

---

## 9. Featured Teaching & Home Slider - Guest Read Access
**Status:** In progress (this task)
**Current state:** Both have `"Authenticated users can read ..."` → `to authenticated` — closed to anonymous.
**Decision:** Add anonymous SELECT policies. Needed for Home screen.
**Action:** Add policies `to public using (true)`.

---

## 10. Live Podcast Participants - Guest Read Access
**Status:** **Stay closed**
**Current state:** Policy `"Anyone can read participants"` → `to public` `using (auth.uid() IS NOT NULL)` — effectively authenticated-only.
**Decision:** Keep closed. Guest doesn't need participant list (they can't join anyway).
**Action:** No change.

---

## 11. Live Podcast Messages - Guest Read Access
**Status:** **Stay closed**
**Current state:** Policy `"Authenticated users can read messages"` → `to public` `using (auth.uid() IS NOT NULL)` — effectively authenticated-only.
**Decision:** Keep closed. Chat is for participants only.
**Action:** No change.

---

## 12. Edge Functions - Anonymous Access Review
**Status:** Review needed
**Functions with `verify_jwt: false`:** `share-redirect` only (intentional, for public sharing links)
**Functions with `verify_jwt: true`:** All livekit-*, music-bot-*, delete-account — correctly block anonymous
**Action:** Verify no new edge functions need anonymous access for guest features.