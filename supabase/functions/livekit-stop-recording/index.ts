// supabase/functions/livekit-stop-recording/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EgressClient } from 'https://esm.sh/livekit-server-sdk@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const isAlreadyStoppedError = (error: unknown) => {
  const message = String((error as { message?: string })?.message ?? error).toLowerCase()
  return (
    message.includes('not found') ||
    message.includes('not_found') ||
    message.includes('ended') ||
    message.includes('not active') ||
    message.includes('does not exist')
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const { egressId, podcastId } = await req.json()

    if (!podcastId && !egressId) {
      return json({ error: 'podcastId or egressId is required' }, 400)
    }

    let recordingEgressId = typeof egressId === 'string' && egressId.length > 0
      ? egressId
      : null

    if (!recordingEgressId && podcastId) {
      const { data: activeRecordings, error: activeRecordingError } = await supabase
        .from('podcast_recordings')
        .select('egress_id')
        .eq('podcast_id', podcastId)
        .eq('status', 'recording')
        .limit(1)

      if (activeRecordingError) {
        console.error('active recording lookup error:', activeRecordingError.message)
        return json({ error: 'Could not check active recording', details: activeRecordingError.message }, 500)
      }

      recordingEgressId = activeRecordings?.[0]?.egress_id ?? null
    }

    if (!recordingEgressId) {
      return json({ success: true, stopped: false, reason: 'No active recording' })
    }

    const egressClient = new EgressClient(
      Deno.env.get('LIVEKIT_URL')!,
      Deno.env.get('LIVEKIT_API_KEY')!,
      Deno.env.get('LIVEKIT_API_SECRET')!
    )

    let stoppedByLiveKit = true
    let stopWarning: string | null = null

    try {
      await egressClient.stopEgress(recordingEgressId)
    } catch (error) {
      if (!isAlreadyStoppedError(error)) {
        console.error('stop egress error:', error)
        return json({
          error: 'Could not stop LiveKit recording',
          details: String((error as { message?: string })?.message ?? error),
          egressId: recordingEgressId,
        }, 502)
      }

      stoppedByLiveKit = false
      stopWarning = String((error as { message?: string })?.message ?? error)
    }

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

    const { error: updateError } = await updateQuery

    if (updateError) {
      const message = updateError.message.toLowerCase()
      const shouldRetryWithoutEndedAt =
        message.includes('ended_at') ||
        message.includes('column') ||
        message.includes('schema cache')

      if (!shouldRetryWithoutEndedAt) {
        console.error('recording update error:', updateError.message)
        return json({
          error: 'Recording stopped but database update failed',
          details: updateError.message,
          egressId: recordingEgressId,
        }, 500)
      }

      let fallbackUpdate = supabase
        .from('podcast_recordings')
        .update({ status: 'completed' })
        .eq('egress_id', recordingEgressId)

      if (podcastId) {
        fallbackUpdate = fallbackUpdate.eq('podcast_id', podcastId)
      }

      const { error: fallbackError } = await fallbackUpdate
      if (fallbackError) {
        console.error('recording fallback update error:', fallbackError.message)
        return json({
          error: 'Recording stopped but database update failed',
          details: fallbackError.message,
          egressId: recordingEgressId,
        }, 500)
      }
    }

    return json({
      success: true,
      stopped: true,
      stoppedByLiveKit,
      warning: stopWarning,
      egressId: recordingEgressId,
    })
  } catch (error) {
    console.error('livekit-stop-recording error:', error)
    return json({
      error: 'Internal server error',
      details: String((error as { message?: string })?.message ?? error),
    }, 500)
  }
})
