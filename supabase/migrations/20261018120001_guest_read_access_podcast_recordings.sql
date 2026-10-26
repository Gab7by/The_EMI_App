-- Migration: 20261018120001_guest_read_access_podcast_recordings.sql
-- Purpose: Grant anonymous (public role) SELECT access to published podcast recordings
-- and create edge function for anonymous signed URL generation
-- Tables: podcast_recordings (via join to live_podcasts)
-- Storage: recordings bucket (via new edge function)
-- All grants are SELECT only, no write access.
-- Rollback: Drop each policy and the edge function listed below.

-- ============================================================
-- 1. podcast_recordings - Library screen for guests
-- ============================================================
-- Current: "Everyone can read recordings" (to public but requires EXISTS profiles WHERE id=auth.uid())
--            effectively authenticated-only
-- New: Add policy for anonymous to read ONLY published recordings from completed sessions
--      Signed-in users keep existing access (admins: all; members: published)
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
      and lp.status = 'completed'
  )
);

-- Rollback:
-- drop policy if exists "Anonymous can read published recordings" on public.podcast_recordings;

-- ============================================================
-- 2. Edge Function: get-recording-url
-- ============================================================
-- Purpose: Generate signed URLs for recordings bucket for anonymous users
--          Only allows access to recordings where publish=true and status=completed
--          This replaces the need to make the recordings bucket public
--          or grant anonymous storage.objects SELECT directly.
--
-- TO APPLY: Run this in Supabase Dashboard > Edge Functions > Create Function
-- Function name: get-recording-url
-- verify_jwt: false (allows anonymous calls)
--
-- BEGIN EDGE FUNCTION CODE (save as supabase/functions/get-recording-url/index.ts):
--
-- import { serve } from 'https://deno.land/std/http/server.ts'
-- import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
--
-- serve(async (req) => {
--   if (req.method === 'OPTIONS') {
--     return new Response('ok', {
--       headers: {
--         'Access-Control-Allow-Origin': '*',
--         'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
--       }
--     })
--   }
--
--   try {
--     const { filePath } = await req.json()
--     if (!filePath) {
--       return new Response(
--         JSON.stringify({ error: 'filePath is required' }),
--         { status: 400, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     // Create Supabase client with service role (bypasses RLS for verification)
--     const supabaseAdmin = createClient(
--       Deno.env.get('SUPABASE_URL')!,
--       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
--     )
--
--     // Verify this recording is published and completed
--     // Extract recording ID from filePath pattern: recordings/{recordingId}/...
--     const recordingId = filePath.split('/')[1]
--     if (!recordingId) {
--       return new Response(
--         JSON.stringify({ error: 'Invalid filePath format' }),
--         { status: 400, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     const { data: recording, error: recError } = await supabaseAdmin
--       .from('podcast_recordings')
--       .select('id, publish, status, podcast_id, live_podcasts!inner(status)')
--       .eq('id', recordingId)
--       .single()
--
--     if (recError || !recording) {
--       return new Response(
--         JSON.stringify({ error: 'Recording not found' }),
--         { status: 404, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     // Check publish status and podcast completion
--     if (recording.publish !== true) {
--       return new Response(
--         JSON.stringify({ error: 'Recording not published' }),
--         { status: 403, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     const podcastStatus = recording.live_podcasts?.status
--     if (podcastStatus !== 'completed') {
--       return new Response(
--         JSON.stringify({ error: 'Recording not ready' }),
--         { status: 403, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     // Generate signed URL (24 hours)
--     const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
--       .from('recordings')
--       .createSignedUrl(filePath, 60 * 60 * 24)
--
--     if (urlError || !signedUrlData?.signedUrl) {
--       return new Response(
--         JSON.stringify({ error: 'Failed to generate signed URL' }),
--         { status: 500, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     return new Response(
--       JSON.stringify({ signedUrl: signedUrlData.signedUrl }),
--       { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
--     )
--
--   } catch (error) {
--     console.error('get-recording-url error:', error)
--     return new Response(
--       JSON.stringify({ error: 'Internal server error' }),
--       { status: 500, headers: { 'Content-Type': 'application/json' } }
--     )
--   }
-- })
--
-- END EDGE FUNCTION CODE
--
-- Rollback:
-- Delete the edge function in Supabase Dashboard > Edge Functions > get-recording-url > Delete