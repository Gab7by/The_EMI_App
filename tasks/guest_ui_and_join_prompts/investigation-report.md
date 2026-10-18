# Step 0 Investigation Report: Guest UI And Join Prompts

## 1. Task 01 Guest State in Store ✅

**Location:** `store/authStore.ts` → `authStatus` field
**Type:** `AuthStatus = 'loading' | 'signed-in' | 'guest' | 'signed-out'`
**How to read:** `useAuthStore(state => state.authStatus)`
**Helper needed:** Add `isGuest: () => boolean` or computed selector

---

## 2. File Locations (Unknown 1)

| Feature | Files |
|---------|-------|
| **Profile Icon (Home)** | `components/profile/homeProfileIcon.tsx` |
| **Profile Icon (Podcast/Library/Giving/Discipleship)** | `components/profile/profileIcon.tsx` → used in `components/profile/podcastProfileBar.tsx` |
| **Profile/Settings Page** | `app/(profile)/entry.tsx` (main), `app/(profile)/_layout.tsx`, `constants/profile.ts` (menu items) |
| **Podcast Tab** | `app/(tabs)/podcast.tsx` |
| **Podcast Card** | `components/podcast/livestreamCard.tsx` |
| **Home Testimonies Area** | `app/(tabs)/index.tsx` (lines 178-191: "Tap to add yours" button) |
| **Empty State (Podcast)** | `components/podcast/no-live-podcast.tsx` |
| **Loading Skeleton** | `components/podcast/podcast-loading-skeleton.tsx` |

---

## 3. Profile Icon in Shared Header (Unknown 2)

**Finding:** Two separate profile icons:
- `HomeProfileIcon` → used in Home tab (`app/(tabs)/index.tsx` via `HomeProfileBar`)
- `ProfileIcon` → used in Podcast, Library, Giving, Discipleship tabs via `PodcastProfileBar`

**Name/Email/Avatar Display Locations (Unknown 3):**
1. `homeProfileIcon.tsx` → shows name ("Hi {name}", "Welcome Home"), avatar/initial
2. `profileIcon.tsx` → shows avatar/initial only (no name)
3. `homeProfileModal.tsx` → shows name, email, avatar
4. `app/(profile)/entry.tsx` → shows name, email, avatar, avatar picker
5. `components/profile/profileModalIcon.tsx` → likely similar

---

## 4. Podcast Tab Fetch & Card Fields (Unknowns 4, 5)

**Fetch:** `app/(tabs)/podcast.tsx` line 55:
```tsx
const { data, isLoading, isRefetching, refetch } = useLivePodcastSessions(profile?.id)
```

**Hook:** `hooks/tanstack-query-hooks.ts` → `useLivePodcastSessions(hostId?)` calls `getLiveSessions(hostId)`

**Service:** `lib/podcast.ts` → `getLiveSessions(hostId?)`:
- With hostId: `OR (host_id=hostId, AND(is_public=true, is_unlisted=false))`
- Without hostId: `is_public=true, is_unlisted=false` → **exactly what guests can read**

**Card Fields Used** (`components/podcast/livestreamCard.tsx` props):
- `title` ✅ (guest readable)
- `playlist` ✅ (guest readable)
- `hostName` ✅ (via profiles join - guest readable)
- `hostPictureUrl` ✅ (via profiles join - guest readable)
- `coverImageUrl` ✅ (guest readable)
- `id` ✅ (guest readable)
- `hostId` ✅ (guest readable)
- **`livekitRoomName` ❌ (MUST NOT expose to guests)**

**Join/Token Trigger:**
- `LiveStreamCard.onPress` → `goToLiveStream()` → routes to `/(podcast)/live-podcast-member` with `livekitRoomName` in params
- `live-podcast-member.tsx` → `useAudienceRoom(livekitRoomName, id)` → calls `livekit-token` edge function (requires auth)
- **Guests must never reach this flow**

---

## 5. MCP Verification: Guest-Readable Fields (Unknown 5)

| Field | Guest Readable? | Notes |
|-------|-----------------|-------|
| `id` | ✅ | |
| `title` | ✅ | |
| `playlist` | ✅ | |
| `is_public` | ✅ | |
| `is_unlisted` | ✅ | |
| `status` | ✅ | |
| `host_id` | ✅ | |
| `cover_image_url` | ✅ | |
| `start_time` | ✅ | |
| `livekit_room_name` | ✅ | **But must not display/use** |
| `host:profiles!host_id(id, full_name, avatar_url, role)` | ✅ | Profiles table has "Anyone can read profiles" policy |

**Policy:** `"Public can read basic session info"` → `to public` `using ((is_public = true) AND (status = 'live'))`
**Matches** the guest fetch exactly.

---

## 6. Pre-Screen Podcast Data Requests (Unknown 6)

**Finding:** None. The podcast tab fetches live podcasts only when the screen renders (`useLivePodcastSessions` in the component body). No prefetching, badges, or background checks detected.

---

## 7. Share App & Legal Entries (Unknown 7)

**Location:** `constants/profile.ts` → `ProfileManagementCategories`:
```tsx
{ key: "share", categoryName: "Share App", icon: Share, ... },
{ key: "legal", categoryName: "Legal", icon: Text, ... },
```
**Behavior:** `onPressFunction` not defined (handled elsewhere or via navigation)
**Reusable:** Yes - these are data objects, can be filtered for guest version

---

## 8. Components Assuming User Object (Unknown 8)

From Task 01 investigation + new findings:
1. `homeProfileIcon.tsx` → `state.session?.user.user_metadata.full_name` fallback
2. `profileIcon.tsx` → same fallback
3. `homeProfileModal.tsx` → `state.session?.user.email`
4. `app/(profile)/entry.tsx` → `state.session?.user.email`, `state.profile`
5. `app/(tabs)/podcast.tsx` → `profile?.role === "admin"` (admin check)
6. `components/podcast/livestreamCard.tsx` → `profile?.role === "admin"` (admin check)
4. `app/(profile)/_layout.tsx` → `profile?.role === "admin"` (route guard)
5. `app/(tabs)/index.tsx` → `profile?.role === "admin"` (edit featured teaching)
6. `app/(tabs)/library.tsx` → `profile?.role === "admin"` (admin features)
7. `app/(tabs)/podcast.tsx` → `profile?.role === "admin"` (start live podcast)

**All use optional chaining** → no crashes for guests, but show "User" fallback

---

## 9. Reusable Button/Card Styles (Unknown 9)

- **Button:** `components/ui/button.tsx` → `Button` component with `variant` (default, destructive, outline, secondary, ghost, link) and `size` (default, sm, lg, icon)
- **Card:** `LiveStreamCard` is memoized, uses `Pressable` with custom styling
- **Empty State:** `NoLiveStreamCard` (simple View/Text/Image)
- **Skeleton:** `PodcastLoadingSkeleton` (uses `Skeleton` from `components/ui/skeleton.tsx`)

---

## 10. Recordings Playback (Unknown 10)

**Where recordings play:**
1. `app/(tabs)/library.tsx` → lists recordings (`getRecordings`)
2. `components/recording/RecordingItem.tsx` → list item, tap to play
3. `hooks/useRecordingPlayer.ts` → `loadRecording()` calls `getRecordingSignedUrl(recording.file_path)`
4. `lib/recording.ts` → `getRecordingSignedUrl()` creates signed URL from `recordings` bucket
5. `components/recording/RecordingPlayerScreen.tsx` → full-screen player modal

**Guest Experience Today:**
- Library tab accessible (Task 01)
- `getRecordings` filters `publish=true` for non-admins (guests are non-admins)
- **BUT** `getRecordingSignedUrl` calls `supabase.storage.from('recordings').createSignedUrl()` → **fails for guests** (bucket is private, policy requires authenticated user)
- Guest would see recording in list but playback fails

**Needed for Anonymous Playback:**
- Use new edge function `get-recording-url` (created in Task 02) with `verify_jwt: false`
- Pass `filePath` → function verifies `publish=true` + `status=completed` → returns signed URL
- Modify `getRecordingSignedUrl` or create new guest-aware function

---

## Proposed Files to Edit

| File | Reason |
|------|--------|
| `store/authStore.ts` | Add `isGuest` computed selector (shared guest check) |
| `types/auth-types.ts` | Add `isGuest` to `AuthType` |
| `components/profile/profileIcon.tsx` | Show "G" for guests instead of avatar/initial |
| `components/profile/homeProfileIcon.tsx` | Show "G" for guests; hide name/email in modal for guests |
| `components/profile/homeProfileModal.tsx` | Guest version: only Join Menorah, Share, Legal |
| `app/(profile)/entry.tsx` | Guest version: hide name/email/avatar; show only 3 menu items |
| `constants/profile.ts` | Export guest-specific categories (Join Menorah, Share, Legal) |
| `app/(tabs)/podcast.tsx` | Branch on guest: fetch without hostId, render guest cards |
| `components/podcast/livestreamCard.tsx` | **Create new `GuestLiveStreamCard`** (no livekitRoomName, Join action only) |
| `app/(tabs)/index.tsx` | Add guest testimonies card above list |
| `components/recording/RecordingItem.tsx` | Report: guest playback fails (signed URL) — **not fixing unless approved** |

---

## Copy to Confirm

| Item | Proposed Copy |
|------|---------------|
| Profile icon (guest) | "G" |
| Profile page entries (guest) | "Join Menorah", "Share App", "Legal" |
| Testimonies card title | "Has God been faithful to you?" |
| Testimonies card action | "Join the Menorah to add yours" |
| Podcast card action | "Join to listen live" |

---

## Decision Needed: Recordings

**Should guest recording playback be implemented in this task?**
- Option A: Yes — modify `getRecordingSignedUrl` to use `get-recording-url` edge function for guests
- Option B: No — just report the issue, defer to future task

**Recommendation:** Option B (report only) — keeps this task focused on UI prompts per frame scope.