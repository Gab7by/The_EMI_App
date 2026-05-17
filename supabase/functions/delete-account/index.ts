import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

const storagePathFromPublicUrl = (url: string | null | undefined, bucket: string) => {
  if (!url) return null

  const marker = `/${bucket}/`
  const path = url.split(marker)[1]?.split('?')[0]

  return path ? decodeURIComponent(path) : null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Missing Supabase environment variables' }, 500)
    }

    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return json({ error: 'Could not load account profile', details: profileError.message }, 500)
    }

    const { data: hostedPodcasts, error: podcastError } = await admin
      .from('live_podcasts')
      .select('id, cover_image_url')
      .eq('host_id', user.id)

    if (podcastError) {
      return json({ error: 'Could not load hosted podcasts', details: podcastError.message }, 500)
    }

    const hostedPodcastIds = hostedPodcasts?.map((podcast) => podcast.id) ?? []
    const coverPaths = hostedPodcasts
      ?.map((podcast) => storagePathFromPublicUrl(podcast.cover_image_url, 'podcast-covers'))
      .filter((path): path is string => Boolean(path)) ?? []

    const avatarPath = storagePathFromPublicUrl(profile?.avatar_url, 'avatars')

    if (avatarPath) {
      await admin.storage.from('avatars').remove([avatarPath])
    }

    if (coverPaths.length > 0) {
      await admin.storage.from('podcast-covers').remove(coverPaths)
    }

    if (hostedPodcastIds.length > 0) {
      const { data: recordings, error: recordingLookupError } = await admin
        .from('podcast_recordings')
        .select('file_path')
        .in('podcast_id', hostedPodcastIds)

      if (recordingLookupError) {
        return json({ error: 'Could not load hosted recordings', details: recordingLookupError.message }, 500)
      }

      const recordingPaths = recordings
        ?.map((recording) => recording.file_path)
        .filter((path): path is string => Boolean(path)) ?? []

      if (recordingPaths.length > 0) {
        await admin.storage.from('recordings').remove(recordingPaths)
      }

      const hostedCleanupSteps = [
        admin.from('live_podcast_messages').delete().in('podcast_id', hostedPodcastIds),
        admin.from('live_podcast_participants').delete().in('podcast_id', hostedPodcastIds),
        admin.from('podcast_recordings').delete().in('podcast_id', hostedPodcastIds),
      ]

      for (const step of hostedCleanupSteps) {
        const { error } = await step
        if (error) {
          return json({ error: 'Could not remove hosted podcast data', details: error.message }, 500)
        }
      }
    }

    const accountCleanupSteps = [
      admin.from('live_podcast_messages').delete().eq('sender_id', user.id),
      admin.from('live_podcast_participants').delete().eq('profile_id', user.id),
      admin.from('live_podcasts').delete().eq('host_id', user.id),
      admin.from('profiles').delete().eq('id', user.id),
    ]

    for (const step of accountCleanupSteps) {
      const { error } = await step
      if (error) {
        return json({ error: 'Could not remove account data', details: error.message }, 500)
      }
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      return json({ error: 'Could not delete auth user', details: deleteUserError.message }, 500)
    }

    return json({ success: true })
  } catch (error) {
    console.error('delete-account error:', error)
    return json({ error: 'Internal server error', details: String(error) }, 500)
  }
})
