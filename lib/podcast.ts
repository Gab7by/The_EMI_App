import { CreateLivePodcastInput, LivePodcast } from "@/types/podcast-types"
import { supabase } from "./supabase"
import { PODCAST_SELECT } from "@/constants/podcast"

export const createLivePodcast = async (
  input: CreateLivePodcastInput
): Promise<LivePodcast | null> => {

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const livekitRoomName = `menorah-${Date.now()}-${user.id.slice(0, 8)}`

  const { data, error } = await supabase
    .from('live_podcasts')
    .insert({
      title: input.title.length > 1 ? input.title : "I will Pray",
      playlist: input.playlist,
      is_public: input.is_public,
      is_unlisted: input.is_unlisted,
      start_time: input.start_time,
      cover_image_url: input.cover_image_url ?? null,
      host_id: user.id,
      status: 'live',
      livekit_room_name: livekitRoomName
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


export async function updateLivePodcast(
  podcastId: string,
  updates: Partial<Pick<CreateLivePodcastInput,
    'title' | 'playlist' | 'cover_image_url'
  >>
): Promise<boolean> {

  const { error } = await supabase
    .from('live_podcasts')
    .update(updates)
    .eq('id', podcastId)

  if (error) {
    console.error('updateLivePodcast:', error.message)
    return false
  }

  return true
}


export const endLiveSession = async (
  podcastId: string
): Promise<boolean> => {
  console.log("podcast id: ", podcastId)
  const { error } = await supabase
    .from('live_podcasts')
    .update({
      status: 'ended',
      end_time: new Date().toISOString(),
    })
    .eq('id', podcastId)

  if (error) {
    console.error('endLiveSession:', error.message)
    return false
  }

  return true
}


export async function getParticipantCount(
  podcastId: string,
  hostId: string
): Promise<number> {

  const { count, error } = await supabase
    .from('live_podcast_participants')
    .select('*', { count: 'exact', head: true })
    .eq('podcast_id', podcastId)
    .neq('profile_id', hostId)  
    .is('left_at', null)

  if (error) {
    console.error('getParticipantCount:', error.message)
    return 0
  }

  return count ?? 0
}