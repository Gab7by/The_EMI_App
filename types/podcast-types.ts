import { Profile } from "./auth-types"

export type liveStreamStartModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamStartDialogModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamInfoModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamVisibilityModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type LiveStreamVisibilityOptionsType = {
    isPublic: boolean
    setIsPublic: React.Dispatch<React.SetStateAction<boolean>>
    isUnlisted: boolean
    setIsUnlisted: React.Dispatch<React.SetStateAction<boolean>>
}

export type LiveStreamInfoType = {
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    playlist: PlaylistOption
    setPlaylist: React.Dispatch<React.SetStateAction<PlaylistOption>>
    isCreatingLivePodcast: boolean
    startLiveStream: (closeModal: () => void) => void
    errorStartingLivePodcast: string | null
}

export type PodcastStatus = 'scheduled' | 'live' | 'ended'

export type Playlist =
  | 'Lunch Prayer Fire'
  | 'Priesthood Time'
  | 'School of the Prophets'
  | 'School of Spiritual Mysteries'
  | 'Mega One Word From the Lord'
  | '45 minutes in Tongues'

export type PlaylistOption = {
    label: string
    value: string
}

export const PLAYLISTS: Playlist[] = [
  'Lunch Prayer Fire',
  'Priesthood Time',
  'School of the Prophets',
  'School of Spiritual Mysteries',
  'Mega One Word From the Lord',
  '45 minutes in Tongues'
]

export type LivePodcastParticipant = {
  id: string
  podcast_id: string
  profile: Profile
  is_called_in: boolean
  joined_at: string
  left_at: string | null
}

export type LivePodcast = {
  id: string
  title: string
  playlist: Playlist   
  is_public: boolean
  is_unlisted: boolean
  status: PodcastStatus
  host: Profile
  livekit_room_name: string
  cover_image_url: string | null
  start_time: string
  end_time: string | null
  created_at: string
  participants: LivePodcastParticipant[]
}

export type CreateLivePodcastInput = {
  title: string
  playlist: Playlist
  is_public: boolean
  is_unlisted: boolean
  start_time: string
  cover_image_url?: string
}

export type LiveStreamCardType = {
    title: string
    playlist: Playlist
    hostPictureUrl: string | null
    hostName: string
    id: string
    hostId: string
    livekit_room_name: string
}

export const PLAYLIST_OPTIONS = PLAYLISTS.map((playlist) => ({
  label: playlist,
  value: playlist,
}))

export type LiveMessage = {
  id: string
  podcast_id: string
  sender_id: string
  sender_name: string
  content: string 
  created_at: string
  isLocal?: boolean
}