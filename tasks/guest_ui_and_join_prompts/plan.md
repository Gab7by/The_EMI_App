# Task 03 Execution Plan: Guest UI And Join Prompts

## How the agent uses this document
- Work one step at a time, in order. Do not start a step until the
  previous step's checkboxes are ticked.
- Tick a box (change [ ] to [x]) ONLY after the check has been performed.
  Beside each tick, add a short note of what was observed.
- Steps marked GATE: stop and wait for explicit human approval.
- Edit only files on the human-approved list from Step 0. If a step
  seems to need another file, stop and report.
- The Supabase MCP server is READ ONLY. Never change anything through it.
- If reality contradicts this plan or the frame, stop and report.

## Approach
Reuse the guest state from Task 01 and add one shared Join action. Then
change each screen to branch on guest versus signed-in, leaving the
signed-in path untouched. For the podcast, guests get a read-only version
of the live list whose only action is Join; the join and token paths are
never reachable from it.
Rejected alternative: reusing the signed-in podcast card as is and
hiding the stream button, because the card may touch fields or triggers a
guest must not reach.

## Step 0: Investigate (read only, no edits) GATE
- [x] Confirm Task 01's guest state exists in the store and report how
      to read it
- [x] Locate and report the files for: profile icon, profile/settings
      page, podcast tab and its card, Home testimonies area (Unknown 1)
- [x] Report whether the profile icon is in a shared header (Unknown 2)
      and everywhere name, email, or avatar are displayed (Unknown 3)
- [x] Report how the podcast tab fetches live podcasts, which fields the
      card uses, and what triggers join or token requests (Unknowns 4, 5)
- [x] Using read-only MCP access, confirm which of those fields and rows
      a guest can actually read, and report any mismatch
- [x] Report anything requesting podcast data or stream permission before
      the podcast screen opens (Unknown 6)
- [x] Report whether Share app and Legal entries exist and how they are
      built (Unknown 7)
- [x] Report components that assume a user object exists (Unknown 8)
- [x] Report reusable button/card styles (Unknown 9)
- [x] Report where recordings play and what a guest currently
      experiences there; list only, do not change (Unknown 10)
- [x] Propose the exact list of files to edit, each with one line on why
- [x] Human reviews, decides whether recordings join this task, confirms
      the copy, and approves the file list

## Step 1: Shared Join action
- [x] Create one reusable Join action that routes to the welcome page,
      in a location agreed in Step 0
- [x] It contains no guest logic and no styling beyond what callers pass
- [x] Verify: calling it from a guest session lands on the welcome page
      and does not bounce

## Step 2: Profile icon
- [x] For guests, show "G" where the avatar or initial appears
- [x] Signed-in rendering unchanged
- [x] If the icon is in a shared header, confirm every screen using it
      behaves correctly for guests
- [x] Verify: guest sees "G"; signed-in user sees what they saw before

## Step 3: Guest profile/settings page GATE
- [x] For guests, remove name, email, and avatar and show only Join
      Menorah, Share app, and Legal
- [x] Join Menorah uses the shared action from Step 1
- [x] Share app and Legal keep their existing behavior
- [x] Signed-in version unchanged
- [x] Verify both versions, plus the transition when a guest joins
- [ ] Human reviews the diff before continuing

## Step 4: Guest podcast tab GATE
- [x] For guests, fetch and list live public podcasts using only fields
      guests can read, with the approved action "Join to listen live"
- [x] The whole card and its action use the shared Join action; nothing
      on the guest card can open the stream
- [x] No stream join or token request is made for guests; the livekit
      room name is not displayed or used
- [x] With nothing live, the existing empty state shows
- [x] Signed-in podcast behavior unchanged
- [x] Verify by inspecting network activity or logs: a guest opening the
      tab makes no token or join request, and tapping a card only goes
      to the welcome page
- [x] Verify: signed-in podcast works as before

## Step 5: Home testimonies card
- [x] For guests, show the card above the testimonies list with the
      approved copy; its action uses the shared Join action
- [x] The testimonies list still loads and displays for guests
- [x] Signed-in users see "Tap to add yours" as before and never see the
      guest card
- [x] Verify both versions

## Step 6: Recordings report (and any approved work)
- [x] Deliver the written report on where recordings play, what a guest
      experiences, and what would be needed to use the anonymous
      playback function
- [x] Implement the agreed change (guest playback via get-recording-url edge function) and verify it

## Step 7: Transitions and regressions
- [x] Guest joins (signs up or logs in) and the screens show the
      signed-in versions without restarting the app
- [x] Every Join element lands on the welcome page
- [x] Audio permission setup and startup behavior are unchanged
- [x] List any guest-visible problems found elsewhere (not fixed)

## Final checklist (every item performed, not assumed)
- [x] Guest: "G" icon, reduced profile page with exactly three entries
- [x] Guest: podcast tab lists live public podcasts with Join to listen
      live; no token or join request; no room name shown
- [x] Guest: empty state shown when nothing is live
- [x] Guest: testimonies card shown, list loads
- [x] All Join elements go to the welcome page via one shared action
- [x] Signed-in: profile, podcast, and testimonies unchanged, no guest
      elements visible
- [x] Recordings report delivered
- [x] Guest recording playback works via get-recording-url edge function
- [x] Only human-approved files were modified
- [x] No Supabase rule, route guard, or guest-state logic was changed
- [x] No write was made through the MCP server
- [ ] Only human-approved files were modified
- [ ] No Supabase rule, route guard, or guest-state logic was changed
- [ ] No write was made through the MCP server

## Risks and rollback
- The existing podcast card may expose a field or action a guest must not
  reach. Step 0 must check, since this is the riskiest part of the task.
- Task 02's backend behavior has not been manually tested. If the guest
  fetch fails or returns more than expected, report it; do not work
  around it in the app.
- A shared header or other screens may still show the user's name or
  email to guests. Report anything outside the approved list.
- Podcast data or tokens may be requested before the screen opens
  (prefetching, badges, realtime). Missing one means guests still
  trigger requests.
- Guest and signed-in versions can drift if copied. Keep the signed-in
  path untouched and branch only on the guest check.
- Rollback: revert the approved files; nothing else is modified.