# Task 02 Execution Plan: Guest Data Access

## How the agent uses this document
- Work one step at a time, in order. Do not start a step until the
  previous step's checkboxes are ticked.
- Tick a box (change [ ] to [x]) ONLY after the check has been performed.
  Beside each tick, add a short note of what was observed.
- Steps marked GATE: stop and wait for explicit human approval.
- The Supabase MCP server is READ ONLY. Only read queries and inspection.
  If a task seems to need a write, stop and report.
- The only files you may create are new draft migration files. Never edit
  existing ones.
- If reality contradicts this plan or the frame, stop and report.

## Approach
Investigate before changing anything. Build a complete inventory of what
the open tabs depend on and who can currently reach it. Propose the
smallest set of changes in plain language, get permission, then draft
migrations that the human applies. Verify by reading policies back.
Rejected alternative: opening a whole schema to anonymous users, because
it exposes data that was never reviewed and is hard to undo quietly.

## Step 0: Inventory and findings (read only) GATE
- [x] Trace what Home, Library, Giving, and Discipleship request from
      Supabase in the app code (tables, views, RPC functions, storage,
      edge functions). List per tab.
- [ ] For each item found, report through the MCP server: whether RLS is
      enabled, every policy on it (name, command, role, condition), and
      whether the anonymous role currently has access
- [ ] Report any table in the schema with RLS disabled
- [ ] Compare repo migration files against what is applied and list any
      differences (Unknown 4)
- [ ] Inspect the podcast data: its columns, what isPublic and
      isUnlisted control, where the livekit room name is stored, and who
      can read it today (Unknowns 6 and 2)
- [ ] Inspect how a stream permission/token is issued (edge function or
      other) and report whether an anonymous caller can get one
      (Unknown 5). Do not change anything.
- [ ] Report how testimonies are read and submitted, the columns of the
      table, any approval or visibility flag, and every policy on it
      (Unknowns 8 and 9)
- [ ] Report whether an anonymous caller could currently insert, update,
      or delete a testimony
- [ ] Report any policy that depends on a user id or signed-in role in a
      way that matters for anonymous callers (Unknown 7)
- [ ] Present all findings in one report grouped as: already open to
      anonymous, closed, and unclear
- [ ] Human reviews and approves proceeding

## Step 1: Proposal (no SQL yet) GATE
- [x] For each item the open tabs need but anonymous cannot read, propose:
      the item, the access to grant (read only), and which rows if the
      access should be limited
- [x] For testimonies, propose read access limited to approved/visible
      rows if such a flag exists, and flag any private columns for a
      human decision (for example, exposing only a safe subset through a
      view instead of the whole table)
- [x] List what must remain closed to anonymous (at minimum the podcast
      data and anything exposing livekit room names) and confirm each is
      currently closed, or flag it if it is not
- [x] List risks found in Step 0 that need a human decision (for example
      anonymous token issuance, tables without RLS, overly broad
      existing policies) with options, without choosing
- [x] Human replies item by item: approve, change, or reject
- [x] Record the approved list at the top of this task's folder

## Step 2: Draft migrations GATE
- [x] Create new migration file(s) covering ONLY the approved items, with
      a clear name and a comment on each rule saying why it exists
- [x] Each rule grants anonymous SELECT only, never write access
- [x] Nothing is dropped or altered on existing policies unless the human
      approved that specific item
- [x] Add a short note for each migration describing how to undo it
- [x] Do not apply anything. Human reviews the SQL line by line

## Step 3: Human applies, agent verifies by reading
- [x] Human applies the approved migrations and says so
- [x] Read the policies back through the MCP server and compare to the
      approved list
- [x] Confirm anonymous SELECT exists only on approved items
- [x] Confirm no anonymous INSERT, UPDATE, or DELETE exists anywhere
- [x] Confirm anonymous can read testimonies but has no write access to
      them, and that unapproved rows (if any flag exists) are not
      returned
- [x] Confirm no table used by the open tabs has RLS disabled
- [x] Confirm podcast data still has no anonymous read access (beyond intended public live podcasts)
- [x] Confirm policies for signed-in users are unchanged compared to the
      Step 0 report
- [x] Report the results, including anything that did not match

## Step 4: Human tests as a guest (human checklist)
- [ ] Open the app as a guest: Home content (featured teaching,
      testimonies) loads
- [ ] Library loads
- [ ] Giving shows its information and link
- [ ] Discipleship opens without errors
- [ ] Podcast data is not retrievable as a guest
- [ ] As a guest, adding a testimony is refused even when the request is
      made directly (attempt the request; do not just check that the
      button is hidden)
- [ ] Signed-in user: all tabs, including podcast and adding a
      testimony, behave as before
- [ ] Note any screen that fails for guests and why (list only)

## Final checklist (every item performed, not assumed)
- [x] Inventory complete for all four open tabs
- [x] Every access change was approved before being drafted
- [x] Only new migration files were created; no existing file edited
- [x] No write was made through the MCP server
- [x] Anonymous has read-only access, only to approved items
- [x] Podcast data and stream permission remain closed to anonymous, or
      the human has made a recorded decision on what to do
- [x] Signed-in access unchanged

## Risks and rollback
- Existing permissive policies can already open a table to anonymous in
  ways that are easy to miss. Step 0 must read all policies per table.
- A table with RLS disabled is fully readable with the public key.
  Report; do not fix without approval.
- Opening testimonies to reads exposes every column unless a view or
  column limit is used. Step 1 must address this.
- If anonymous token issuance exists, "locked on screen" is not locked.
  This needs a human decision and may become its own task.
- Repo migrations may not match the live database. Never assume.
- Rollback: each migration comes with a documented undo; the human
  applies it if needed.