# Task 01: Guest Session And Routing

## Problem
Today the app treats anyone without a Supabase session as someone who must
sign in or sign up. Visitors cannot see any tab without creating an account.

## Outcome
- A new state, "guest", exists: a user with no Supabase session who has
  chosen to skip the welcome page.
- Guests can enter and navigate the tabs.
- On first install the user lands on the welcome page, which offers a way
  to skip and go to Home.
- The guest choice is remembered, so later launches go straight to Home.
- Guests can still reach the welcome, login, and sign-up screens (needed
  later for "Join Menorah").
- A user who has a valid session is unaffected, and a valid session always
  takes priority over a stored guest choice.

## Scope
- Only how the app decides who the current user is and which screens they
  may reach.
- Includes: guest state, remembering the choice, route access rules,
  the skip action.

## Out of scope
- Guest profile page (separate task)
- Locked podcast screen (separate task)
- Any Supabase or backend access rules (separate task)
- Any change to what individual tab screens display
- Join Menorah buttons themselves (this task only ensures their
  destination is reachable)
- Redesigning sign-out or post-sign-up routing: existing behavior is
  preserved and only reported on (deferred to later work)
- Fixing tab screens that misbehave for guests: list them, do not fix them

## Constraints
- Files allowed: app/_layout.tsx, store/authStore.ts, and app/index.tsx
  (welcome page), the last ONLY for adding the skip action.
- The guest choice is persisted with SecureStore. The store action
  performs the write; the welcome page contains no storage code and no
  routing logic, it only calls the store action.
- Existing startup behavior must remain intact: splash screen, session
  check, and audio permission setup.

## Evidence (observed by human; agent must confirm in Step 0)
- _layout.tsx shows the splash screen at startup and authenticates the
  user during that time.
- _layout.tsx uses protected stacks that keep logged-out users out of the
  tabs and limit them to welcome, login, and sign-up.
- _layout.tsx sets up audio permissions at startup.
- app/index.tsx is the welcome page.
- SecureStore is the persistence mechanism to use.

## Success criteria
- Fresh install: welcome page appears, with a visible skip option.
- After skipping, the user reaches Home and can open every tab.
- Closing and reopening the app goes straight to Home, with no flash of
  the welcome page.
- A signed-in user's launch behaves exactly as before.
- A guest can navigate to welcome, login, and sign-up and is not bounced.
- An expired or missing session with no stored choice is not treated as
  a guest.
- Audio permissions are still requested at startup.

## Delegation
- Builder agent makes changes; human reviews the plan before any code
  and approves the merge.

## Unknowns
1. Do any tab screens assume a logged-in user object exists (could crash
   for guests)?
   Discoverable: the agent reads the files and lists any such screens
   without fixing them. The human decides what to do with the findings.