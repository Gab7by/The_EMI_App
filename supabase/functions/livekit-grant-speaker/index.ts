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
    // Verify the caller is authenticated
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

    // Verify the caller is actually the host of this session
    // prevents any authenticated user from granting speaker rights
    const { roomName, participantIdentity, podcastId } = await req.json()

    const { data: podcast } = await supabase
      .from('live_podcasts')
      .select('host_id')
      .eq('id', podcastId)
      .single()

    if (!podcast || podcast.host_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the host can grant speaker permissions' }),
        { status: 403 }
      )
    }

    // Use LiveKit's RoomServiceClient to update participant permissions
    // This changes what the participant can do server-side
    // their existing token constraints are overridden by this call
    const livekitHost = Deno.env.get('LIVEKIT_URL')!
    // Note: this is the HTTP URL not the WSS URL
    // e.g. https://your-project.livekit.cloud not wss://

    const roomService = new RoomServiceClient(
      livekitHost,
      Deno.env.get('LIVEKIT_API_KEY')!,
      Deno.env.get('LIVEKIT_API_SECRET')!
    )

    await roomService.updateParticipant(roomName, participantIdentity, undefined, {
      canPublish: true,       // now they can send audio
      canSubscribe: true,     // they could already do this
      canPublishData: true,   // they could already do this
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('livekit-grant-speaker error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
})