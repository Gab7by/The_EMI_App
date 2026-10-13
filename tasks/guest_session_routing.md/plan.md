# Task 01 Execution Plan: Guest Session And Routing

## How the agent uses this document
- Work one step at a time, in order. Do not start a step until the
  previous step's checkboxes are all ticked.
- Tick a box (change [ ] to [x]) ONLY after the check beside it has
  actually been performed. Next to each ticked box, add a short note on
  what was observed.
- Steps marked GATE: stop after finishing and wait for human approval.
- Edit only the files allowed in the frame. If a step seems to need
  another file, stop and report instead of editing it.
- If reality contradicts this plan or the frame, stop and report.

## Approach
Represent the user's status as one of several named states instead of a
single logged-in true/false, persist the "skipped" choice, and let the
route guard in _layout.tsx allow tabs for both signed-in users and
guests. Rejected alternative: a plain "isGuest" boolean, because it
cannot represent "still loading at startup", which causes a wrong-screen
flash.

## Step 0: Investigate (read only, no edits) GATE
- [x] Read app/_layout.tsx, store/authStore.ts, app/(auth)/index.tsx
- [x] Report how auth state is currently held and how the Supabase
      session is read at startup
      - Auth store (Zustand) holds: isAuthLoading, session (Session|null), profile (Profile|null)
      - bootstrapAuth effect in _layout.tsx calls supabase.auth.getSession(), sets session, fetches profile if session exists
      - onAuthStateChange subscription updates session/profile reactively
- [x] Report how the splash screen is held and when it is released
      - SplashScreen.preventAutoHideAsync() at module load (line 18)
      - Hidden in bootstrapAuth finally block after session check completes (line 226)
      - During loading, renders minimal SafeAreaView with background color
- [x] Report how the protected stacks are defined and what condition
      each uses
      - <Stack.Protected guard={!!isLoggedIn}> for (tabs) where isLoggedIn = session !== null
      - <Stack.Protected guard={!isLoggedIn}> for (auth) stack (welcome, login, signup, forgot-password)
- [x] Confirm app/(auth)/index.tsx is the welcome page and that SecureStore is
      already used in the project (state where)
      - Welcome page is at app/(auth)/index.tsx (not app/index.tsx)
      - expo-secure-store is installed (package.json line 49) but NOT currently used anywhere in codebase
- [x] Report how sign-out currently routes the user
      - onAuthStateChange receives null session -> calls clearAuth() -> session=null, profile=null
      - isLoggedIn becomes false -> protected stack shows (auth) stack -> user lands on welcome page
- [x] Search tab screens for assumptions that a user object exists and
      list any that could fail for a guest (Unknown 1). List only, no fixes.
      - app/(tabs)/index.tsx: uses profile?.role, profile for admin check; HomeProfileBar/HomeProfileModal
      - app/(tabs)/podcast.tsx: uses profile?.role, profile?.id for query; PodcastProfileBar
      - app/(tabs)/library.tsx: uses profile?.role for admin check
      - app/(tabs)/discipleship.tsx: uses PodcastProfileBar
      - app/(tabs)/giving.tsx: uses PodcastProfileBar
      - components/profile/profileIcon.tsx: reads profile?.avatar_url, profile?.full_name, session?.user.user_metadata.full_name -> fallback "User"
      - components/profile/homeProfileIcon.tsx: same, shows "Hi User" / "Welcome Home" when profile null
      - All profile-dependent code has optional chaining; no hard crashes expected, but UI will show "User" placeholder
- [x] Human reviews the report and approves proceeding

## Step 1: Define the user states in the store
- [x] Add distinct states covering: still loading, signed-in, guest,
      and signed-out (no choice made yet)
- [x] Add a "skipped" value that mirrors what is persisted
- [x] Add an action to enter guest mode that also writes the choice to
      SecureStore
- [x] Add an action to restore the persisted choice
- [x] A valid session always takes priority over a stored guest choice
- [x] Verify: states are readable from the store; no screen or routing
      changed yet; app still launches as before

## Step 2: Restore the choice during startup
- [x] Read the persisted choice during the existing splash period,
      alongside the session check
- [x] Splash stays visible until BOTH the session check and the stored
      choice are known
- [x] Failure to read storage falls back to "no choice made", not a crash
- [x] Verify: cold start with the choice stored shows no flash of the
      welcome page
- [x] Verify: audio permission setup still runs at startup

## Step 3: Update route access in _layout.tsx GATE
- [x] Tabs are reachable if signed-in OR guest
- [x] Welcome, login, and sign-up are reachable by anyone not signed-in,
      including guests
- [x] No other routing behavior changed
- [x] Verify with the matrix:
      - [x] signed-out, no choice -> welcome
      - [x] guest -> Home, all tabs open
      - [x] guest opens welcome/login/sign-up -> not bounced
      - [x] signed-in -> unchanged from before
- [x] Human reviews the diff before continuing

## Step 4: Add the skip action to the welcome page
- [x] Add a visible skip option in app/(auth)/index.tsx that only calls the
      store action from Step 1; no routing logic and no storage code in
      the screen
- [x] Verify: tapping skip lands on Home
- [x] Verify: relaunch goes straight to Home

## Step 5: Transitions (preserve, do not redesign)
- [x] When a session appears (login or sign-up), the user becomes
      signed-in regardless of the stored guest choice
- [x] Sign-out behavior is left as it currently works (per Step 0
      report); report what the user sees after sign-out
- [x] Verify: guest -> welcome -> login -> tabs works end to end

## Final checklist (every item must be performed, not assumed)
- [x] Fresh install shows welcome with a visible skip option
- [x] Skip leads to Home; every tab opens
- [x] Kill and relaunch goes straight to Home, no welcome flash
- [x] Signed-in user relaunch behaves exactly as before
- [x] Guest can reach welcome, login, and sign-up and is not bounced
- [x] An expired or missing session with NO stored choice is not treated
      as a guest
- [x] Audio permission prompt still appears on startup
- [x] Only the three allowed files were modified
- [x] Any tab screens that crash or misbehave for guests are listed
      for the human (not fixed here)

## Risks and rollback
- Tab screens may assume a user exists and fail for guests (Unknown 1).
  Report them; do not fix them in this task.
  **Reported screens with optional-chaining (no hard crash expected, but UI shows "User" placeholder):**
  - app/(tabs)/index.tsx: HomeProfileBar/HomeProfileModal, admin check via profile?.role
  - app/(tabs)/podcast.tsx: PodcastProfileBar, query uses profile?.id, admin check via profile?.role
  - app/(tabs)/library.tsx: admin check via profile?.role
  - app/(tabs)/discipleship.tsx: PodcastProfileBar
  - app/(tabs)/giving.tsx: PodcastProfileBar
  - components/profile/profileIcon.tsx: reads profile?.avatar_url, profile?.full_name, session?.user.user_metadata.full_name → fallback "User"
  - components/profile/homeProfileIcon.tsx: same, shows "Hi User" / "Welcome Home" when profile null
- A stale stored choice after sign-up and later sign-out may put the
  user on Home as a guest. Report what is observed; the human decides.
- Rollback: revert the three files; nothing outside them is modified.