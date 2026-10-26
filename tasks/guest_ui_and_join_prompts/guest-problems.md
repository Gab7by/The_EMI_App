# Guest-Visible Problems Found (Not Fixed in This Task)

## 1. Discipleship Tab - Locked Learning Paths
**File:** `app/(tabs)/discipleship.tsx`, `constants/discipleship.ts`
**Issue:** Some learning paths show as "locked" (e.g., "School of Ministry", "Mentorship", "School of Christian Mysticism"). Guests see these locked cards but have no indication that joining would unlock them. The lock UI is the same for guests and signed-in non-eligible users.
**Suggested Fix:** Add "Join to unlock" indicator for guests on locked paths.

## 2. Giving Tab - No Guest Indication
**File:** `app/(tabs)/giving.tsx`
**Issue:** Giving screen works for guests (no auth required for static content + external payment link), but there's no prompt suggesting guests join for a more integrated giving experience (e.g., tracking donations, recurring giving).
**Suggested Fix:** Add subtle "Join to track your giving" banner for guests.

## 3. Library Tab - Admin-Only Features Visible But Disabled
**File:** `app/(tabs)/library.tsx`, `components/recording/RecordingItem.tsx`
**Issue:** Admin-only buttons (publish toggle, delete) are hidden via `isAdmin` check which correctly returns false for guests (no profile). However, the download button (via `useRecordingDownload`) may behave unexpectedly for guests since it checks local storage which should work.
**Status:** Minor - download uses local AsyncStorage, should work for guests.

## 4. Profile Page - Share App / Legal Placeholder Alerts
**File:** `constants/profile.ts`, `app/(profile)/entry.tsx`
**Issue:** "Share App" and "Legal" buttons show placeholder alerts ("coming soon") for both guests and signed-in users. Not a regression, but incomplete feature.
**Status:** Pre-existing, not introduced by this task.

## 5. Home Profile Modal - Share App / Legal Navigation
**File:** `components/profile/homeProfileModal.tsx`
**Issue:** For guests, "Share App" and "Legal" buttons in the modal navigate to the profile entry screen (`router.push("/(profile)/entry")`) rather than performing their actual actions. The profile entry screen then shows the same placeholder alerts.
**Suggested Fix:** Implement proper Share and Legal screens/actions.

## 6. Testimonies Detail Screen - Guest Comment/Interaction
**File:** `app/(testimonies)/[id].tsx` (not inspected but inferred)
**Issue:** Guests can read testimonies and comments (Task 02), but likely cannot add comments or see "Add Comment" UI. The detail screen may show comment input for guests which would fail on submit.
**Status:** Not verified in this task - would need inspection.

## 7. Live Podcast Member/Admin Screens - Deep Link Protection
**File:** `app/(podcast)/live-podcast-member.tsx`, `app/(podcast)/live-podcast-admin.tsx`
**Issue:** If a guest somehow gets a deep link to these screens (e.g., shared link), they would hit the `useAudienceRoom` hook which calls `livekit-token` edge function (requires auth). The edge function returns 401, but the UI may show a confusing error state.
**Mitigation:** Route guards in Task 01 prevent guests from navigating to these routes via the app, but deep links bypass the app's navigation.

## 8. Profile Modal Icon - Guest Avatar
**File:** `components/profile/profileModalIcon.tsx` (not inspected)
**Issue:** The larger profile icon in the modal (ProfileModalIcon) may not have been updated to show "G" for guests. Only `profileIcon.tsx` and `homeProfileIcon.tsx` were updated.
**Status:** Need to verify and fix if needed.

## 9. ProfileModalIcon Component
**File:** `components/profile/profileModalIcon.tsx`
**Issue:** Same as above - likely shows "User" initial for guests instead of "G".

## 10. Toast/Notification for Guest Actions
**General:** No toast/notification when guest taps "Join to listen live" or "Join the Menorah to add yours" - they just navigate to welcome page. Could add a brief "Redirecting to join..." toast for better UX.
**Status:** Minor UX improvement.

---

## Summary

**Critical:** None - all core flows work for guests
**Medium:** #1 (Discipleship locked paths), #8/#9 (ProfileModalIcon)
**Low:** #2, #4, #5, #6, #7, #10

These items are documented for future tasks and do not block the current implementation.