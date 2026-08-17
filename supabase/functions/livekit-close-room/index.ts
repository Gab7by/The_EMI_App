import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { RoomServiceClient } from 'https://esm.sh/livekit-server-sdk@2'

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers })
  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) return json({ error: 'Unauthorized' }, 401)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
    const { data: { user } } = await supabase.auth.getUser()
    const { roomName, podcastId } = await req.json()
    if (!user || !roomName || !podcastId) return json({ error: 'Unauthorized or invalid room' }, 401)
    const { data: podcast } = await supabase.from('live_podcasts').select('host_id').eq('id', podcastId).maybeSingle()
    if (!podcast || podcast.host_id !== user.id) return json({ error: 'Only the host can close this room' }, 403)
    const client = new RoomServiceClient(Deno.env.get('LIVEKIT_URL')!, Deno.env.get('LIVEKIT_API_KEY')!, Deno.env.get('LIVEKIT_API_SECRET')!)
    await client.deleteRoom(roomName)
    return json({ success: true })
  } catch (error) {
    const message = String((error as { message?: string })?.message ?? error)
    // Deleting a room which has already emptied is an idempotent close.
    if (message.toLowerCase().includes('not found')) return json({ success: true })
    console.error('livekit-close-room:', error)
    return json({ error: 'Could not close LiveKit room', details: message }, 502)
  }
})
