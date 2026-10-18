# Task 02: Guest Data Access

## Problem
Task 01 lets guests (no Supabase session) enter the app. Supabase treats
guests as the anonymous role, and today the backend likely refuses their
requests, so tabs that should work for guests would load empty or fail.
At the same time, podcast data must remain unavailable to guests, and
guests must be able to read testimonies but not add them.

## Outcome
- Anonymous users can READ the data needed by: Home (featured teaching,
  testimonies), Library, Giving (information and link), and Discipleship
  (if it reads anything).
- Anonymous users can read testimonies but cannot add, edit, or delete
  them.
- Anonymous users cannot read podcast data, including live status and
  livekit room details, and cannot obtain permission to join a live
  stream.
- Anonymous users cannot WRITE to anything.
- Signed-in users' access is unchanged.
- Every table, view, function, and storage bucket touched by the open
  tabs is accounted for in a written inventory, and every access change
  has been approved by the human before being drafted.

## Scope
- Supabase access rules only: row level security policies, grants, and
  anything that decides what the anonymous role may read.
- Includes: inventory, proposal, drafted migration files, post-apply
  verification by reading.

## Out of scope
- Any change to app code (screens, routing, stores): report problems, do
  not fix them
- The guest profile page, the locked podcast screen, and the Home
  testimonies card (Task 03)
- Letting anonymous users write anything (donations, comments, signups,
  testimonies)
- Redesigning how live streaming or token issuance works: report how it
  is protected today and stop
- Changing any rule for signed-in users beyond what is strictly required
  for this task

## Constraints
- The Supabase MCP server is READ ONLY. The agent must never apply
  migrations, run write statements, change policies, edit functions, or
  alter settings through it.
- Allowed file changes: NEW migration files in the existing migrations
  folder, as drafts only. Do not edit or delete existing migration files.
- The human reviews and applies all SQL. The agent never assumes a draft
  has been applied.
- Do not draft any migration until the human has approved the proposal
  step.
- Principle: anonymous access is granted per table, for read only, as
  narrowly as possible. Nothing is opened "just in case".
- If anything is uncertain or ambiguous, stop and report it to the human
  instead of choosing.

## Evidence (observed by human; agent must confirm in Step 0)
- Home fetches featured teaching and testimonies.
- Testimonies are readable by guests; adding one requires an account.
- Giving shows information and a link to a web page.
- Discipleship is UI only for now.
- The podcast data has isPublic and isUnlisted fields and a livekit room
  name that is created per session.
- Some access rules exist as migration files in the repo; others may have
  been set elsewhere (for example the dashboard).
- Edge functions and database objects can be inspected through the MCP
  server.

## Success criteria
- The inventory lists every table, view, function, and storage bucket the
  open tabs depend on, with its current anonymous access and RLS status.
- After the human applies the approved migrations, reading the policies
  back confirms: anonymous SELECT exists only on the approved list, no
  anonymous INSERT/UPDATE/DELETE exists anywhere, and no table used by
  the open tabs has RLS disabled.
- Anonymous SELECT on testimonies works; anonymous INSERT, UPDATE, or
  DELETE on testimonies is refused by the backend.
- Testimony rows returned to anonymous users do not expose private
  fields (such as emails or internal user ids) beyond what the app
  displays, and unapproved rows (if an approval flag exists) are not
  returned.
- The podcast table (and anything exposing livekit room names) has no
  anonymous read access.
- It is documented whether an anonymous caller can obtain a stream token
  and, if so, the human has decided what to do about it.
- Signed-in access is unchanged, confirmed by comparing policies before
  and after.

## Delegation
- Builder agent investigates and drafts; human approves the proposal,
  reviews the SQL, applies it, and approves the merge.

## Unknowns (agent discovers via MCP and reports; human decides)
1. Which tables, views, functions, and storage buckets does each open tab
   actually use?
2. Which existing policies already allow anonymous access, including
   permissive ones that combine with new ones?
3. Are any of those tables missing RLS entirely?
4. Do the migration files in the repo match what is actually applied in
   the database?
5. How does the app obtain permission to join a live stream, and can an
   anonymous caller trigger it?
6. What exactly do isPublic and isUnlisted control today, and do any
   rules depend on them?
7. Do any rules depend on a user id in a way that would break or leak
   for anonymous callers?
8. How are testimonies submitted (direct table insert, function, or
   other), and does that path require a signed-in user?
9. Does the testimonies table hold fields that should not be public
   (author id, email, phone, moderation notes), and is there an
   approved/published flag that anonymous reads should respect?