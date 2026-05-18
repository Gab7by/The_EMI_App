import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { RoomServiceClient } from 'https://esm.sh/livekit-server-sdk@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const { roomName, participantIdentity, podcastId, trackSid, muted = true } = await req.json()

    if (!roomName || !participantIdentity || !podcastId || !trackSid) {
      return json({
        error: 'roomName, participantIdentity, podcastId and trackSid are required',
        received: {
          roomName: roomName ?? null,
          participantIdentity: participantIdentity ?? null,
          podcastId: podcastId ?? null,
          trackSid: trackSid ?? null,
        },
      }, 400)
    }

    const { data: podcast, error: podcastError } = await supabase
      .from('live_podcasts')
      .select('host_id, status, livekit_room_name')
      .eq('id', podcastId)
      .single()

    if (podcastError) {
      return json({ error: 'Podcast lookup failed', details: podcastError.message }, 400)
    }

    if (!podcast || podcast.host_id !== user.id) {
      return json({ error: 'Only the host can mute a speaker' }, 403)
    }

    if (podcast.status !== 'live' || podcast.livekit_room_name !== roomName) {
      return json({ error: 'Room name does not match the active podcast' }, 403)
    }

    const livekitHost = Deno.env.get('LIVEKIT_URL')
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY')
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      return json({ error: 'Missing LiveKit environment variables' }, 500)
    }

    const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret)
    const track = await roomService.mutePublishedTrack(
      roomName,
      participantIdentity,
      trackSid,
      Boolean(muted)
    )

    return json({ success: true, muted: Boolean(muted), trackSid: track.sid ?? trackSid })
  } catch (error) {
    console.error('livekit-mute-speaker error:', error)
    return json({
      error: 'Internal server error',
      details: String((error as { message?: string })?.message ?? error),
    }, 500)
  }
})
