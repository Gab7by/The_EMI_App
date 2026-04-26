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
    about: string
    setAbout: React.Dispatch<React.SetStateAction<string>>
    isCreatingLivePodcast: boolean
    startLiveStream: (closeModal: () => void) => void
}

export type PodcastStatus = 'scheduled' | 'live' | 'ended'

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
  about: string | null
  is_public: boolean
  is_unlisted: boolean
  status: PodcastStatus
  host: Profile       
  cover_image_url: string | null
  start_time: string
  end_time: string | null
  created_at: string
  participants: LivePodcastParticipant[]
}

export type CreateLivePodcastInput = {
  title: string
  about?: string
  is_public: boolean
  is_unlisted: boolean
  start_time: string
  cover_image_url?: string
}
