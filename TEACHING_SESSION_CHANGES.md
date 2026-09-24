# Teaching-session changes — to implement after the walkthrough

Running log of decisions made while going through the codebase together.
Nothing here is implemented yet — this is a queue for afterward.

---

## 1. Route by "is the host of *this* session," not "is *an* admin"

**Current behavior:**
- `components/podcast/livestreamCard.tsx`'s `goToLiveStream()` sends anyone
  with `profile.role === "admin"` to `/(podcast)/live-podcast-admin` (full
  host controls), and everyone else to `/(podcast)/live-podcast-member` -
  regardless of whether they actually started that particular session.
- `app/(podcast)/_layout.tsx` enforces the same thing one level deeper via
  `Stack.Protected guard={!!isAdmin}` / `guard={!isAdmin}` - a coarse
  "is this profile an admin at all" check, not session-specific.

**Desired behavior (agreed):**
- All admins can still **create** their own live sessions (the `+` button /
  modal flow in `app/(tabs)/podcast.tsx`, gated by `isAdmin` - unchanged).
- Only the **host of that specific session** (`profile.id === hostId` for
  the session being opened) should land on the admin/host screen with host
  controls. A different admin tapping someone else's live card should get
  the member screen, same as anyone else.
- Co-host features are explicitly deferred - not part of this change.

**Implementation notes for later** (the tricky part):
- `Stack.Protected`'s `guard` is evaluated per-route-name, not per
  navigation instance - it has no access to *which* session's `hostId` is
  being requested. So it can't by itself enforce "host of this session";
  it can only gate "is this profile an admin at all" (worth keeping as a
  coarse first gate - a non-admin should still never reach the admin
  screen, full stop).
- The **fine-grained, per-session check** ("is `profile.id` actually
  `hostId` for *this* session") has to live inside
  `live-podcast-admin.tsx` itself (it already receives `hostId` as a
  route param) - on mount/param-change, compare `profile.id` to `hostId`
  and redirect to the member screen (with the same params) if they don't
  match, rather than trusting the caller.
- `livestreamCard.tsx`'s `goToLiveStream` changes from `if (isAdmin)` to
  `if (profile?.id === hostId)`.
- The "create new session" path (`podcast.tsx` → `createLivePodcast()` →
  routes straight to `live-podcast-admin`) needs no change - the creator
  becomes the session's host, so they already satisfy the new check.

**Files likely touched:** `components/podcast/livestreamCard.tsx`,
`app/(podcast)/_layout.tsx`, `app/(podcast)/live-podcast-admin.tsx`.
