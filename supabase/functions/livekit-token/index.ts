/// <reference types="https://deno.land/x/deno/cli/types.d.ts" />

import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@2'

serve(async (req) => {

  // Handle CORS — needed for requests coming from your mobile app
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Step 1 — verify the user is authenticated
    // The Authorization header contains the user's Supabase JWT
    // supabase.functions.invoke() attaches this automatically
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client that acts as this specific user
    // This lets us verify their JWT and fetch their profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify the JWT is valid and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Step 2 — get the request body
    const { roomName, isHost, podcastId } = await req.json()

    if (!roomName) {
      return new Response(
        JSON.stringify({ error: 'roomName is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Step 3 — fetch the user's profile to get their display name
    // This shows correctly in LiveKit's participant list
    let podcastQuery = supabase
      .from('live_podcasts')
      .select('id, host_id, status, livekit_room_name')
      .eq('livekit_room_name', roomName)

    if (podcastId) {
      podcastQuery = podcastQuery.eq('id', podcastId)
    }

    const { data: podcast, error: podcastError } = await podcastQuery.maybeSingle()

    if (podcastError) {
      return new Response(
        JSON.stringify({ error: 'Podcast lookup failed', details: podcastError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!podcast || podcast.status !== 'live') {
      return new Response(
        JSON.stringify({ error: 'Live podcast room not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (isHost && podcast.host_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the podcast host can join as host' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Step 4 — generate the LiveKit token using your secret key
    // This runs server-side only — the secret never reaches the mobile app
    const apiKey = Deno.env.get('LIVEKIT_API_KEY')!
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')!

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      // identity is a unique string identifying this participant
      // using the Supabase user id ensures it is always unique

      name: profile?.full_name ?? 'Listener',
      // name is the display name shown in the LiveKit room
      // falls back to 'Listener' if profile has no name

      ttl: '4h',
      // token expires in 4 hours
      // if a session runs longer, the participant needs a new token
      // 4 hours is more than enough for a church session
    })

    // Step 5 — set permissions based on whether this is the host
    token.addGrant({
      roomJoin: true,
      // allows this participant to join the room at all

      room: roomName,
      // scopes this token to one specific room only
      // cannot be used to join any other room

      canPublish: isHost,
      // true for host — they can send audio
      // false for audience — receive only
      // this is enforced server-side by LiveKit
      // a bad actor cannot override this client-side

      canSubscribe: true,
      // everyone can receive audio from publishers

      canPublishData: true,
      // everyone can send data channel messages
      // needed for raise hand and chat
    })

    const jwt = await token.toJwt()

    return new Response(
      JSON.stringify({ token: jwt }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (error) {
    console.error('livekit-token error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
