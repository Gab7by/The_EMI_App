import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admins only', role: profile?.role ?? null }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action = 'play', roomName, trackUrl, trackName } = await req.json()

    if (!roomName) {
      return new Response(JSON.stringify({ error: 'roomName is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const botUrl = Deno.env.get('MUSIC_BOT_URL')
    const botSecret = Deno.env.get('BOT_SECRET')

    if (!botUrl || !botSecret) {
      return new Response(JSON.stringify({
        error: 'Music bot is not configured',
        MUSIC_BOT_URL: botUrl ? 'set' : 'missing',
        BOT_SECRET: botSecret ? 'set' : 'missing',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action !== 'play' && action !== 'status') {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'play' && (!trackUrl || !trackName)) {
      return new Response(JSON.stringify({ error: 'trackUrl and trackName are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch(`${botUrl}/music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botSecret}`,
      },
      body: JSON.stringify({
        action,
        roomName,
        trackUrl,
        trackName,
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      const detail = responseText
      return new Response(JSON.stringify({
        error: 'Music bot play failed',
        status: response.status,
        statusText: response.statusText,
        detail,
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let botResult = null
    try {
      botResult = responseText ? JSON.parse(responseText) : null
    } catch {
      botResult = responseText
    }

    return new Response(JSON.stringify({ ok: true, bot: botResult }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('music-bot-play error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
