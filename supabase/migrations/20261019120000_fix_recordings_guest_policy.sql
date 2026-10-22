-- Fix: RLS policy for anonymous recordings access uses wrong status value
-- The live_podcasts status values are: 'scheduled', 'live', 'ended'
-- The policy incorrectly used 'completed' which doesn't exist

drop policy if exists "Anonymous can read published recordings" on public.podcast_recordings;

create policy "Anonymous can read published recordings"
on public.podcast_recordings
for select
to public
using (
  publish = true
  and exists (
    select 1 from public.live_podcasts lp
    where lp.id = podcast_recordings.podcast_id
      and lp.status = 'ended'
  )
);

-- Rollback:
-- drop policy if exists "Anonymous can read published recordings" on public.podcast_recordings;
-- (The original incorrect policy would need to be recreated if rollback needed)