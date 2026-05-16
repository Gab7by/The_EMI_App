// supabase/functions/livekit-stop-recording/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EgressClient } from 'https://esm.sh/livekit-server-sdk@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { egressId, podcastId } = await req.json()

    if (!podcastId && !egressId) {
      return new Response(JSON.stringify({ error: 'podcastId or egressId is required' }), { status: 400 })
    }

    let recordingEgressId = egressId

    if (!recordingEgressId && podcastId) {
      const { data: activeRecordings, error: activeRecordingError } = await supabase
        .from('podcast_recordings')
        .select('egress_id')
        .eq('podcast_id', podcastId)
        .eq('status', 'recording')
        .limit(1)

      if (activeRecordingError) {
        console.error('active recording lookup error:', activeRecordingError.message)
        return new Response(JSON.stringify({ error: 'Could not check active recording' }), { status: 500 })
      }

      const activeRecording = activeRecordings?.[0]
      recordingEgressId = activeRecording?.egress_id ?? null
    }

    if (!recordingEgressId) {
      return new Response(
        JSON.stringify({ success: true, stopped: false, reason: 'No active recording' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const egressClient = new EgressClient(
      Deno.env.get('LIVEKIT_URL')!,
      Deno.env.get('LIVEKIT_API_KEY')!,
      Deno.env.get('LIVEKIT_API_SECRET')!
    )

    // Stop the recording
    await egressClient.stopEgress(recordingEgressId)

    // Update database record
    let updateQuery = supabase
      .from('podcast_recordings')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('egress_id', recordingEgressId)

    if (podcastId) {
      updateQuery = updateQuery.eq('podcast_id', podcastId)
    }

    await updateQuery

    return new Response(
      JSON.stringify({ success: true, stopped: true, egressId: recordingEgressId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('livekit-stop-recording error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
})
