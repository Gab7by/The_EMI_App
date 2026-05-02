import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { RoomServiceClient } from 'https://esm.sh/livekit-server-sdk@2'

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

    const { roomName, participantIdentity, podcastId } = await req.json()

    if (!roomName || !participantIdentity || !podcastId) {
      return new Response(
        JSON.stringify({
          error: 'roomName, participantIdentity and podcastId are required',
          received: {
            roomName: roomName ?? null,
            participantIdentity: participantIdentity ?? null,
            podcastId: podcastId ?? null,
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data: podcast, error: podcastError } = await supabase
      .from('live_podcasts')
      .select('host_id')
      .eq('id', podcastId)
      .single()

    if (podcastError) {
      return new Response(
        JSON.stringify({ error: 'Podcast lookup failed', details: podcastError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!podcast || podcast.host_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the host can revoke speaker permissions' }),
        { status: 403 }
      )
    }

    const livekitHost = Deno.env.get('LIVEKIT_URL')
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY')
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      return new Response(
        JSON.stringify({
          error: 'Missing LiveKit environment variables',
          received: {
            LIVEKIT_URL: livekitHost ? 'set' : 'missing',
            LIVEKIT_API_KEY: livekitApiKey ? 'set' : 'missing',
            LIVEKIT_API_SECRET: livekitApiSecret ? 'set' : 'missing',
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const roomService = new RoomServiceClient(
      livekitHost,
      livekitApiKey,
      livekitApiSecret
    )

    await roomService.updateParticipant(roomName, participantIdentity, undefined, {
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('livekit-revoke-speaker error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
