# Recordings Report - Guest Experience

## Where Recordings Play in the App

1. **Library Tab** (`app/(tabs)/library.tsx`) - Main recordings list
2. **RecordingItem Component** (`components/recording/RecordingItem.tsx`) - List item, tap to play
3. **useRecordingPlayer Hook** (`hooks/useRecordingPlayer.ts`) - Audio playback logic
4. **RecordingPlayerScreen Component** (`components/recording/RecordingPlayerScreen.tsx`) - Full-screen player modal
5. **getRecordingSignedUrl** (`lib/recording.ts`) - Generates playback URLs

## Guest Experience Before This Task

- **Library tab accessible** (Task 01 route guard allows guests)
- **Recordings list loads** (getRecordings filters `publish=true` for non-admins, guests are non-admins)
- **Playback FAILS** - `getRecordingSignedUrl` calls `supabase.storage.from('recordings').createSignedUrl()` which requires authenticated user (bucket is private, policy: "Every authenticated user can read recordings")

## Implementation: Guest Recording Playback

### Changes Made

1. **Modified `lib/recording.ts` - `getRecordingSignedUrl` function:**
   - Checks `useAuthStore.getState().isGuest`
   - For guests: calls `supabase.functions.invoke("get-recording-url", { body: { filePath } })`
   - For signed-in users: uses direct `supabase.storage.createSignedUrl()` (unchanged)

2. **Edge Function `get-recording-url`** (created in Task 02, deployed):
   - `verify_jwt: false` - allows anonymous calls
   - Validates recording has `publish=true` and linked `live_podcasts.status='completed'`
   - Generates 24-hour signed URL from private `recordings` bucket using service role
   - Returns `{ signedUrl }` or appropriate error

### Guest Experience Now

- Guest opens Library tab → sees published recordings
- Guest taps recording → `getRecordingSignedUrl` detects guest → calls edge function
- Edge function validates recording is published & completed → returns signed URL
- Recording plays in full-screen player (RecordingPlayerScreen) normally
- All playback controls work (seek, speed, next/previous, download)

### Security

- Edge function validates `publish=true` AND `status='completed'` before issuing URL
- Cannot access unpublished or in-progress recordings
- Service role key used only server-side, never exposed to client
- 24-hour URL expiry limits exposure window

## Files Modified for Guest Recordings

| File | Change |
|------|--------|
| `lib/recording.ts` | `getRecordingSignedUrl` branches on `isGuest`, calls edge function for guests |

## Testing Notes

- Verify guest can play published recordings end-to-end
- Verify guest CANNOT play unpublished recordings (edge function returns 403)
- Verify signed-in user playback unchanged (direct signed URL)
- Verify edge function deployed with `verify_jwt: false`