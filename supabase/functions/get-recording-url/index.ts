// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { filePath } = await req.json()
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "filePath is required" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Verify this recording is published and completed
    // Extract recording ID from filePath pattern: recordings/{recordingId}/...
    const recordingId = filePath.split("/")[1]
    if (!recordingId) {
      return new Response(
        JSON.stringify({ error: "Invalid filePath format" }),
        { status: 400, headers: corsHeaders }
      )
    }

    const { data: recording, error: recError } = await supabaseAdmin
      .from("podcast_recordings")
      .select("id, publish, status, podcast_id, live_podcasts!inner(status)")
      .eq("id", recordingId)
      .single()

    if (recError || !recording) {
      return new Response(
        JSON.stringify({ error: "Recording not found" }),
        { status: 404, headers: corsHeaders }
      )
    }

    // Check publish status and podcast completion
    if (recording.publish !== true) {
      return new Response(
        JSON.stringify({ error: "Recording not published" }),
        { status: 403, headers: corsHeaders }
      )
    }

    const podcastStatus = recording.live_podcasts?.status
    if (podcastStatus !== "ended") {
      return new Response(
        JSON.stringify({ error: "Recording not ready" }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Generate signed URL (24 hours)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from("recordings")
      .createSignedUrl(filePath, 60 * 60 * 24)

    if (urlError || !signedUrlData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL" }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ signedUrl: signedUrlData.signedUrl }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error("get-recording-url error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    )
  }
})