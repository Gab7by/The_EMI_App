import { CreateLivePodcastInput, LivePodcast } from "@/types/podcast-types"
import { supabase } from "./supabase"
import { PODCAST_SELECT } from "@/constants/podcast"

export const createLivePodcast = async (
  input: CreateLivePodcastInput
): Promise<LivePodcast | null> => {

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('live_podcasts')
    .insert({
      title: input.title.length > 1 ? input.title : "I will Pray",
      about: input.about ?? null,
      is_public: input.is_public,
      is_unlisted: input.is_unlisted,
      start_time: input.start_time,
      cover_image_url: input.cover_image_url ?? null,
      host_id: user.id,
      status: 'live'
    })
    .select(PODCAST_SELECT)
    .single()

  if (error) {
    console.error('createLivePodcast:', error.message)
    return null
  }

  return data as LivePodcast
}


export const getLiveSessions = async (): Promise<LivePodcast[]> => {

  const { data, error } = await supabase
    .from('live_podcasts')
    .select(PODCAST_SELECT)
    .eq('status', 'live')
    .eq('is_public', true)
    .eq('is_unlisted', false)
    .order('start_time', { ascending: false })

  if (error) {
    console.error('getLiveSessions:', error.message)
    return []
  }

  return data as LivePodcast[]
}