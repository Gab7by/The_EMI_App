import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const podcastId = url.searchParams.get("id");

  if (!podcastId) {
    return new Response(
      JSON.stringify({ error: "Invalid link" }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: session } = await supabase
    .from("live_podcasts")
    .select("title, playlist, status")
    .eq("id", podcastId)
    .single();

  return new Response(
    JSON.stringify({
      title: session?.title ?? "Live Session",
      playlist: session?.playlist ?? "",
      status: session?.status ?? "inactive",
    }),
    {
      status: 200,
      headers: corsHeaders,
    }
  );
});