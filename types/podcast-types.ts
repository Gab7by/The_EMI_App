import { ReactNode } from "react"
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
    livekitRoomName: string,
    coverImageUrl: string | null
}

export const PLAYLIST_OPTIONS = PLAYLISTS.map((playlist) => ({
  label: playlist,
  value: playlist,
}))

export type MessageType = 'text' | 'image' | 'system'

export type ReplyPreview = {
  sender_name: string
  content: string
  message_type: MessageType
}

export type LiveMessage = {
  id: string
  podcast_id: string
  sender_id: string
  sender_name: string
  sender_avartar_url: string | null
  content: string 
  message_type: MessageType
  created_at: string
  reply_to_id: string | null
  reply_preview: ReplyPreview | null
  edited_at: string | null
  isLocal?: boolean
}

/**
 * Result of an asynchronous chat mutation (send / edit / delete).
 * `ok` is `false` when the operation failed so the UI can show an
 * error snackbar instead of silently pretending everything worked.
 */
export type ChatActionResult = {
  ok: boolean
  error?: string | null
}

export type LivePodcastInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export type LivePodcastInvitation = {
  id: string
  podcast_id: string
  inviter_id: string
  invitee_id: string
  status: LivePodcastInvitationStatus
  created_at: string
  expires_at: string | null
  accepted_at: string | null
}

export type PodcastBackgroundProps = {
  coverUrl: string | null
  children: ReactNode
}

export type MusicTrack = {
  id: string
  name: string
  url: string
  path?: string | null
  duration_seconds: number | null
}

export type AudioPickerAsset = {
  uri: string
  name: string
  mimeType: string
  size: number
}

export type Recording = {
  id: string
  podcast_id: string
  file_path: string
  status: 'recording' | 'completed' | 'failed'
  publish: boolean
  started_at: string
  duration_seconds: number | null
  podcast_title?: string
  playlist?: string
}