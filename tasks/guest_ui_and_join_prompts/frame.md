# Task 03: Guest UI And Join Prompts

## Problem
Guests can now enter the app (Task 01) and read allowed data (Task 02),
but the interface still treats everyone as a signed-in member: the
profile shows account details, the podcast tab has no guest version, and
there is no invitation for guests to join.

## Outcome
- ONE shared "Join Menorah" action exists, and it routes the user to the
  welcome page. Every Join element below uses it.
- Profile icon: guests see a generic "G" in place of their avatar or
  initial. Tapping it opens the profile/settings page.
- Profile/settings page for guests: name, email, and avatar are not
  shown. Only three items remain: Join Menorah, Share app, Legal.
- Podcast tab for guests: guests see the currently live public podcasts
  as cards showing only the information the backend allows guests to
  read. Each card's action reads "Join to listen live" and uses the
  shared Join action. Guests cannot enter or open the live stream.
- Podcast tab when nothing is live: the existing empty state is shown.
- Home testimonies for guests: above the testimonies list, a card reads
  "Has God been faithful to you?" with "Join the Menorah to add yours"
  beneath it. The action routes to the welcome page.
- Signed-in users see everything exactly as they do today, including
  "Tap to add yours" in the testimonies area and the normal podcast
  experience, with no guest elements.

## Scope
- Only what guests see and how they are invited to join, in the app's
  screens and components.
- Includes: the shared Join action, the "G" icon, the reduced profile
  page, the guest podcast cards, the Home testimonies card, and a
  read-only report on recordings.

## Out of scope
- Defining or changing the guest state or route guards (Task 01)
- Any Supabase rule, migration, or edge function (Task 02)
- Library, Giving, and Discipleship screens, except reporting
  recordings behavior
- Wiring the app to the anonymous recording playback function: report
  where recordings play and what would be needed; do not implement
  unless the human adds it to this task after reading the report
- Redesigning sign-out or post-sign-up routing
- Visual redesign beyond what is listed; match existing styles
- Fixing guest problems found elsewhere: list them, do not fix them

## Constraints
- The guest state comes from the store created in Task 01. Do not
  re-derive "guest" from session checks in screens.
- The guest check is made only where needed; do not scatter duplicated
  logic. Prefer one small shared way to ask "is this user a guest".
- Guests must never trigger the stream join or token request, and the
  livekit room name is never shown or used for guests.
- Guest podcast cards may show only fields guests are permitted to read.
  If the existing card uses a field a guest cannot read, stop and report.
- The Supabase MCP server may be used READ ONLY, to confirm what a guest
  can read. Never change anything through it. Backend behavior from
  Task 02 has not yet been manually tested, so treat it as unverified and
  report any mismatch instead of working around it.
- Allowed files are NOT fixed in advance. Step 0 proposes the exact list;
  the human approves it before any edit. Editing any file outside the
  approved list requires stopping and asking.
- Do not touch audio permission setup or startup behavior.
- If anything is uncertain or ambiguous, stop and report it to the human.

## Evidence (observed by human; agent must confirm in Step 0)
- The app has five tabs: Home, Library, Discipleship, Giving, Podcast.
- A profile icon exists and opens a profile/settings page showing name,
  email, and avatar, with Share app and Legal entries.
- The Home screen shows featured teaching and a testimonies list.
- Signed-in users see "Tap to add yours" in the testimonies area.
- The welcome page is app/index.tsx and is reachable by guests (Task 01).
- Task 02 decision: guests can read public live podcast rows but cannot
  join or obtain stream tokens. A new edge function serves recording
  playback to anonymous users.
- Podcast data has isPublic and isUnlisted fields and a livekit room name.

## Copy (human supplies final text; confirm before use)
- Profile icon: "G"
- Profile page entries: "Join Menorah", "Share app", "Legal"
- Testimonies card title: "Has God been faithful to you?"
- Testimonies card action: "Join the Menorah to add yours"
- Podcast card action: "Join to listen live" (proposed; human to confirm)

## Success criteria
- As a guest: the profile icon shows "G"; the profile page shows only
  Join Menorah, Share app, and Legal, with no name, email, or avatar.
- As a guest: the Podcast tab lists live public podcasts, each with
  "Join to listen live"; tapping any card or action goes to the welcome
  page and never into the stream.
- As a guest: no stream token or join request is made, and no room name
  appears in the UI (verified by inspecting network activity or logs).
- As a guest: with nothing live, the existing empty state shows.
- As a guest: the testimonies card appears above the list and the list
  still loads.
- Every Join element lands on the welcome page.
- As a signed-in user: profile, podcast, and testimonies are unchanged,
  and no guest element is visible.
- Switching from guest to signed-in (after joining) shows the normal
  versions without restarting the app.
- A written report states where recordings play and what a guest
  experiences there.

## Delegation
- Builder agent makes changes; human reviews the plan and the file list
  before any code, and approves the merge.

## Unknowns (agent discovers and reports; human decides)
1. Which files render the profile icon, the profile page, the podcast
   tab, and the Home testimonies area?
2. Is the profile icon in a shared header used by several screens?
3. Where else are the user's name, email, or avatar shown, and would a
   guest see them there?
4. How does the podcast tab fetch live podcasts today, and does the
   fetch work for a guest (fields, filters such as isPublic and
   isUnlisted, realtime subscriptions)?
5. Does the existing podcast card use any field or action a guest
   cannot read or must not trigger (room name, join, token request)?
6. Does anything request podcast data or stream permission before the
   screen opens (prefetching, badges, background checks)?
7. Do Share app and Legal already exist as entries, reusable for the
   guest page?
8. Which components assume a user object exists (carry over Task 01,
   Unknown 5)?
9. Is there an existing shared button or card style to reuse?
10. Where do recordings play in the app, what does a guest experience
    there today, and what would be needed to use the new anonymous
    playback function?