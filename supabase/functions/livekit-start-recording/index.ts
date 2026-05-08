// supabase/functions/livekit-start-recording/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    EgressClient,
    EncodedFileOutput,
    EncodedFileType,
    RoomCompositeOptions
} from 'https://esm.sh/livekit-server-sdk@2'

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

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admins only' }), { status: 403 })
        }

        const { roomName, podcastId } = await req.json()

        const egressClient = new EgressClient(
            Deno.env.get('LIVEKIT_URL')!,
            Deno.env.get('LIVEKIT_API_KEY')!,
            Deno.env.get('LIVEKIT_API_SECRET')!
        )

        // Unique filename per recording
        const filePath = `${podcastId}/${Date.now()}.ogg`

        // Room composite egress — records ALL audio from everyone in the room
        // audio_only: true — no video processing, lighter and faster
        const egressInfo = await egressClient.startRoomCompositeEgress(
            roomName,
            {
                file: new EncodedFileOutput({
                    fileType: EncodedFileType.OGG,
                    // OGG is the correct audio-only container
                    // lighter than MP4, no video overhead
                    filepath: filePath,
                    output: {
                        case: 's3',
                        value: {
                            accessKey: Deno.env.get('S3_ACCESS_KEY')!,
                            secret: Deno.env.get('S3_SECRET_KEY')!,
                            region: Deno.env.get('S3_REGION')!,
                            bucket: 'recordings',
                            endpoint: Deno.env.get('S3_ENDPOINT')!,
                            forcePathStyle: true,
                        }
                    }
                })
            },
            {
                audioOnly: true,
                // audioOnly: true tells LiveKit not to spin up Chrome for video rendering
                // much more efficient for podcast-style audio sessions
            }
        )

        await supabase.from('podcast_recordings').insert({
            podcast_id: podcastId,
            egress_id: egressInfo.egressId,
            file_path: filePath,
            status: 'recording',
        })

        return new Response(
            JSON.stringify({ egressId: egressInfo.egressId }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('livekit-start-recording error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        )
    }
})