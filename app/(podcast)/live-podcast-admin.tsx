import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import {
  HostAvatar,
  MAX_GUEST_SPEAKERS,
  PodcastBackground,
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastConnectingOverlay,
  PodcastDialog,
  PodcastHeader,
  PodcastNotesDialog,
  PodcastParticipantsGrid,
  SPEAKER_LIMIT_MESSAGE,
  usePodcastFooterLayout,
} from "@/components/podcast/livePodcastShared";
import { BibleReader } from "@/components/podcast/bibleReader";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useHostRooom } from "@/hooks/useHostRoom";
import { useLiveRoomSnapshot } from "@/hooks/useLiveRoomSnapshot";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { hapticMedium } from "@/lib/haptics";
import { BACKGROUND_MUSIC_DEFAULT_VOLUME, PODCAST_MIC_CAPTURE_OPTIONS } from "@/lib/livekit-audio";
import { approveSpeaker, muteSpeaker, revokeSpeaker, sendBackgroundChangedSignal, sendBibleNavigation, sendSessionEnded } from "@/lib/livekit-signals";
import { ensureMicrophonePermission } from "@/lib/permissions";
import { closeLiveKitRoom, endLiveSession, updateParticipantCalledIn } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { startRecording, stopRecording } from "@/lib/recording";
import { pickAudioFile, pickImage, uploadPodcastBackground } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore";
import { useLiveKitStore } from "@/store/livekit-store";
import { AudioPickerAsset, LivePodcastParticipant, MusicTrack } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronRight, Loader2, Mic, MicOff, Power, RefreshCw, Share2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteMusicTrack, getMusicBotStatus, pauseMusicTrack, playMusicTrack, resumeMusicTrack, setMusicTrackVolume, shutdownMusicBot, stopMusicTrack, uploadMusicTrack, warmMusicBot } from "@/lib/music";
import { useActiveLivePodcastParticipants, useBackgoundMusicQuery } from "@/hooks/tanstack-query-hooks";
import MusicSheet from "@/components/podcast/musicSheet";
import { shareLivePodcast } from "@/lib/share";

type AdminSheet = "none" | "settings" | "music" | "speakers" | "participants";

const AdminLivePodcast = () => {
  const { id, title, playlist, hostId, hostName, hostPictureUrl, livekitRoomName, coverImageUrl } = useLocalSearchParams<{
    id: string;
    title: string;
    hostId: string;
    hostName: string;
    hostPictureUrl: string;
    playlist: string;
    livekitRoomName: string
    coverImageUrl?: string
  }>();

  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions()
  const { footerBottom, footerPaddingBottom, scrollPaddingBottom, handleFooterLayout } =
    usePodcastFooterLayout();

  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isBibleVisible, setIsBibleVisible] = useState(false);
  const [bibleBookId, setBibleBookId] = useState<string | null>(null);
  const [bibleChapter, setBibleChapter] = useState<number | null>(null);
  const [activeSheet, setActiveSheet] = useState<AdminSheet>("none");
  const [isMessageComposerVisible, setIsMessageComposerVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isEndingSession, setIsEndingSession] = useState(false);
  const messageInputRef = useRef<TextInput | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [shouldShowConnectingOverlay, setShouldShowConnectingOverlay] = useState(true);
  const [coverUrl, setcoverUrl] = useState<string | null>(
    (coverImageUrl || null)
  )
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [approvingRequests, setApprovingRequests] = useState<Set<string>>(new Set())
  const [mutingSpeakers, setMutingSpeakers] = useState<Set<string>>(new Set())
  const [removingSpeakers, setRemovingSpeakers] = useState<Set<string>>(new Set())
  const [egressId, setEgressId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [hasRequestedRecording, setHasRequestedRecording] = useState(false)
  const [isRecordingActionLoading, setIsRecordingActionLoading] = useState(false)
  const [selectedMusicAsset, setSelectedMusicAsset] = useState<AudioPickerAsset | null>(null)
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrack | null>(null)
  const [playingMusicTrack, setPlayingMusicTrack] = useState<MusicTrack | null>(null)
  const [uploadedMusicName, setUploadedMusicName] = useState<string | null>(null)
  const [isUploadingMusic, setIsUploadingMusic] = useState(false)
  const [isMusicActionLoading, setIsMusicActionLoading] = useState(false)
  const [isMusicStatusLoading, setIsMusicStatusLoading] = useState(false)
  const [musicStatusMessage, setMusicStatusMessage] = useState<string | null>(null)
  const [speakerLimitMessage, setSpeakerLimitMessage] = useState<string | null>(null)
  const [musicVolume, setMusicVolume] = useState(BACKGROUND_MUSIC_DEFAULT_VOLUME)
  const [isMusicPaused, setIsMusicPaused] = useState(false)
  const [deletingMusicTrackId, setDeletingMusicTrackId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isRefreshingLiveParticipants, setIsRefreshingLiveParticipants] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; senderName: string } | null>(null)

  const room = useLiveKitStore(state => state.room)
  const isMuted = useLiveKitStore(state => state.isMuted)
  const setIsMuted = useLiveKitStore(state => state.setIsMuted)
  const setForegroundServiceType = useLiveKitStore(state => state.setForegroundServiceType)
  const clearRoom = useLiveKitStore(state => state.clearRoom)
  const connectionState = useLiveKitStore(state => state.connectionState)

  const profile = useAuthStore(state => state.profile)
  const { data: musicTracks = [], isLoading: isLoadingMusicTracks } = useBackgoundMusicQuery()
  const {
    data: activeParticipants = [],
    isLoading: isLoadingActiveParticipants,
    refetch: refetchActiveParticipants,
  } = useActiveLivePodcastParticipants(id)

  const isConnecting = connectionState !== 'connected'

  useFocusEffect(
    useCallback(() => {
      setShouldShowConnectingOverlay(true);

      return () => {
        setShouldShowConnectingOverlay(false);
      };
    }, [])
  );
  
  useHostRooom(livekitRoomName, id)

  const {raisedHands, dismissRaisedHand} = useRoomSignals(room, profile?.id ?? "")
  const {messages, isLoading: isChatLoading, sendMessage, sendImage, editMessage, deleteMessage, canDeleteMessage, canEditMessage, sendSystemMessage} = useRoomChat(
    room,
    id,
    profile?.id ?? '',
    profile?.role
  )

  // Only "joined" gets a durable room event. "left" is intentionally not
  // persisted - it added noise (people dropping in and out during a long
  // live session) without being useful history, and doubled the row count
  // every session was writing to Supabase.
  //
  // Both actions still refresh the DB-backed participant list, though - this
  // LiveKit event fires in real time and at zero Supabase cost, on every
  // connected client including the host's. Using it to invalidate
  // active-live-podcast-participants is what let us take that query's
  // refetchInterval from every 2s down to a long safety-net interval below:
  // the host learns about joins/leaves instantly via LiveKit instead of
  // waiting on (or depending on) the poll to notice.
  const handleParticipantChange = useCallback((action: 'joined' | 'left', participantId: string, participantName: string) => {
    if (action === 'joined') {
      void sendSystemMessage(`${participantName} joined the live room`, `joined:${participantId}`)
    }
    queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
  }, [sendSystemMessage, id])

  const { participants: roomParticipants } = useLiveRoomSnapshot(room, handleParticipantChange)
  const latestRaisedHand = raisedHands[raisedHands.length - 1]
  const participantCount = roomParticipants.filter((participant) => participant.id !== hostId).length
  const liveRoomParticipantIds = useMemo(
    () => new Set(roomParticipants.map((participant) => participant.id)),
    [roomParticipants]
  )
  const activeAudienceParticipants = useMemo(
    () => activeParticipants.filter((participant) => {
      const participantId = participant.profile?.id
      return participantId && participantId !== hostId && liveRoomParticipantIds.has(participantId)
    }),
    [activeParticipants, hostId, liveRoomParticipantIds]
  )
  const participantSheetListHeight = Math.min(420, Math.max(260, windowHeight * 0.46))

  useEffect(() => {
    const startRecordingWhenConnected = async () => {
      if (!room || connectionState !== 'connected' || isRecording || egressId || hasRequestedRecording) {
        return
      }

      setHasRequestedRecording(true)

      const newEgressId = await startRecording(livekitRoomName, id)
      if (newEgressId) {
        setEgressId(newEgressId)
        setIsRecording(true)
      } else {
        console.error('Automatic recording start failed after room connection')
      }
    }

    startRecordingWhenConnected()
  }, [room, connectionState, isRecording, egressId, hasRequestedRecording, livekitRoomName, id])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    const result = await sendMessage(message, profile?.full_name ?? "User", profile?.avatar_url ?? null, replyingTo?.messageId)
    if (result.ok) {
      setMessage('')
      setReplyingTo(null)
    }
  }
  const canSendMessage = message.trim().length > 0

  const handleRefreshLiveParticipants = async () => {
    if (isRefreshingLiveParticipants) return

    setIsRefreshingLiveParticipants(true)
    try {
      await refetchActiveParticipants()
    } finally {
      setIsRefreshingLiveParticipants(false)
    }
  }

  useEffect(() => {
  let focusTimeout: NodeJS.Timeout;

  if (isMessageComposerVisible) {
    focusTimeout = setTimeout(() => {
      messageInputRef.current?.focus();
    }, 60);
  }

  const showSubscription = Keyboard.addListener(
    "keyboardDidShow",
    (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    }
  );

  const hideSubscription = Keyboard.addListener(
    "keyboardDidHide",
    () => {
      setKeyboardHeight(0);
      setIsMessageComposerVisible(false);
    }
  );

  return () => {
    if (focusTimeout) clearTimeout(focusTimeout);
    showSubscription.remove();
    hideSubscription.remove();
  };
}, [isMessageComposerVisible]);

  const closeAllOverlays = () => {
    setActiveSheet("none");
    setIsMessageComposerVisible(false);
  };

  const leaveLiveRoom = () => {
    setIsEndingSession(true)

    const finish = async () => {
        if (room && profile) {
          await sendSessionEnded(room, profile.id, profile.full_name ?? 'Host')
        }

        // Fully disconnects the music bot rather than leaving it warm - it
        // has no session to come back to. closeLiveKitRoom below would
        // eventually force this anyway (deleting the room disconnects
        // every participant, bot included), but doing it explicitly here
        // lets the bot shut down its ffmpeg process cleanly instead of
        // just having its connection yanked.
        void shutdownMusicBot(livekitRoomName)

        await stopRecording(egressId, id)

        const success = await endLiveSession(id)
        if (!success) {
            console.error('Failed to end live session in backend')
        }

        if (room) {
          await closeLiveKitRoom(livekitRoomName, id)
          await room.localParticipant.setMicrophoneEnabled(false)
        }

        clearRoom()

        queryClient.invalidateQueries({ queryKey: ['live-podcast-sessions'] })

        setIsEndingSession(false)
        setIsExitPromptVisible(false)
        router.replace('/(tabs)/podcast')
    }

    finish().catch((error) => {
        console.error('Error during leaveLiveRoom:', error)
        setIsEndingSession(false)
    })
}

  const handleToggleMic = async () => {
    if (!room) return

    const newMutedState = !isMuted

    if (!newMutedState) {
      const granted = await ensureMicrophonePermission()
      if (!granted) {
        console.error("Microphone permission denied - cannot unmute")
        return
      }
    }

    await room.localParticipant.setMicrophoneEnabled(
      !newMutedState,
      !newMutedState ? PODCAST_MIC_CAPTURE_OPTIONS : undefined
    )

    setIsMuted(newMutedState)
    setForegroundServiceType(newMutedState ? "mediaPlayback" : "microphone")
  }

  const hostSnapshot = useMemo(
    () => roomParticipants.find((participant) => participant.id === hostId),
    [hostId, roomParticipants]
  )

  const speakerRows = useMemo(() => [
    {
      id: hostId,
      name: hostName,
      avatarUrl: hostPictureUrl ?? null,
      isMuted,
      isHost: true,
      isSpeaking: hostSnapshot?.isSpeaking ?? false,
      audioLevel: hostSnapshot?.audioLevel ?? 0,
      audioTrackSid: hostSnapshot?.audioTrackSid ?? null,
    },
    ...roomParticipants
      .filter((participant) => participant.id !== hostId && participant.canPublish)
      .map((participant) => ({
        id: participant.id,
        name: participant.isLocal ? profile?.full_name ?? participant.name : participant.name,
        avatarUrl: participant.isLocal ? profile?.avatar_url ?? null : null,
        isMuted: !participant.isMicrophoneEnabled,
        isHost: false,
        isSpeaking: participant.isSpeaking,
        audioLevel: participant.audioLevel,
        audioTrackSid: participant.audioTrackSid,
      }))
  ], [
    hostId,
    hostName,
    hostPictureUrl,
    hostSnapshot?.audioTrackSid,
    hostSnapshot?.audioLevel,
    hostSnapshot?.isSpeaking,
    isMuted,
    profile?.avatar_url,
    profile?.full_name,
    roomParticipants,
  ])

  const speakerGridParticipants = useMemo(() => speakerRows.map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    pictureUrl: speaker.avatarUrl,
    isSpeaking: speaker.isSpeaking,
    audioLevel: speaker.audioLevel,
  })), [speakerRows])

  const activeGuestSpeakerCount = useMemo(
    () => speakerRows.filter((speaker) => !speaker.isHost).length,
    [speakerRows]
  )

  const showSpeakerLimitMessage = useCallback(() => {
    setSpeakerLimitMessage(SPEAKER_LIMIT_MESSAGE)
  }, [])

  useEffect(() => {
    if (!speakerLimitMessage) return

    const timeout = setTimeout(() => {
      setSpeakerLimitMessage(null)
    }, 3200)

    return () => clearTimeout(timeout)
  }, [speakerLimitMessage])

  const handleApproveRaisedHand = async (participantId: string) => {
    if (!room || !profile || approvingRequests.has(participantId)) return

    const participantIsAlreadySpeaker = speakerRows.some((speaker) => speaker.id === participantId && !speaker.isHost)
    if (!participantIsAlreadySpeaker && activeGuestSpeakerCount >= MAX_GUEST_SPEAKERS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      showSpeakerLimitMessage()
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    setApprovingRequests(prev => new Set(prev).add(participantId))

    try {
      const approved = await approveSpeaker(
        room,
        profile.id,
        profile.full_name ?? "Host",
        participantId,
        livekitRoomName,
        id
      )
      if (!approved) return

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      await updateParticipantCalledIn(id, participantId, true)
      dismissRaisedHand(participantId)
      queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      console.error("Failed to approve speaker:", error)
    } finally {
      setApprovingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(participantId)
        return newSet
      })
    }
  }

  const handleRejectRaisedHand = (participantId: string) => {
    dismissRaisedHand(participantId)
  }

  const handleRemoveSpeaker = async (participantId: string) => {
    if (!room || !profile || removingSpeakers.has(participantId)) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setRemovingSpeakers(prev => new Set(prev).add(participantId))

    try {
      const revoked = await revokeSpeaker(
        room,
        profile.id,
        profile.full_name ?? "Host",
        participantId,
        livekitRoomName,
        id
      )
      if (!revoked) return

      await updateParticipantCalledIn(id, participantId, false)
      queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      console.error("Failed to remove speaker:", error)
    } finally {
      setRemovingSpeakers(prev => {
        const newSet = new Set(prev)
        newSet.delete(participantId)
        return newSet
      })
    }
  }

  const handleMuteSpeaker = async (participantId: string, trackSid: string | null) => {
    if (!trackSid || mutingSpeakers.has(participantId)) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setMutingSpeakers(prev => new Set(prev).add(participantId))

    try {
      const muted = await muteSpeaker(participantId, livekitRoomName, id, trackSid, true)
      if (muted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      console.error("Failed to mute speaker:", error)
    } finally {
      setMutingSpeakers(prev => {
        const newSet = new Set(prev)
        newSet.delete(participantId)
        return newSet
      })
    }
  }

  const handleBackgroundUpload = async () => {
    const asset = await pickImage({
      allowsEditing: false
    })

    if (!asset) return

    setUploadingBackground(true)

    const newCoverUrl = await uploadPodcastBackground(asset, id, coverUrl)

    if (newCoverUrl) {
      setcoverUrl(newCoverUrl)

      if (room && profile) {
        await sendBackgroundChangedSignal(room, profile.id, newCoverUrl)
      }
      queryClient.invalidateQueries({ queryKey: ['live-podcast-sessions'] })
    }

    setUploadingBackground(false)
  }

  const handleToggleRecording = async () => {
    setIsRecordingActionLoading(true)
    try {
      if (isRecording) {
        const success = await stopRecording(egressId, id)
        if (success) {
          setIsRecording(false)
          setEgressId(null)
        }
      } else {
        const newEgressId = await startRecording(livekitRoomName, id)
        if (newEgressId) {
          setIsRecording(true)
          setEgressId(newEgressId)
        }
      }
    } finally {
      setIsRecordingActionLoading(false)
    }
  }

  const handleMusicPick = async () => {
    setUploadError(null)
    setUploadedMusicName(null)

    const asset = await pickAudioFile()
    if (!asset) return

    setSelectedMusicAsset(asset)
  }

  const handleMusicUpload = async () => {
    if (!selectedMusicAsset) {
      setUploadError("Choose an audio file first.")
      return
    }

    setUploadError(null)
    setIsUploadingMusic(true)

    const track = await uploadMusicTrack(selectedMusicAsset)

    setIsUploadingMusic(false)

    if (track) {
      setUploadedMusicName(track.name)
      setSelectedMusicTrack(track)
      setSelectedMusicAsset(null)
      queryClient.invalidateQueries({ queryKey: ["music-tracks"] })
    } else {
      setUploadError("Failed to upload track. Please try again.")
    }
  }

  const handlePlayMusic = async () => {
    if (!selectedMusicTrack || isMusicActionLoading) return

    setUploadError(null)
    setMusicStatusMessage(null)
    setIsMusicActionLoading(true)

    const success = await playMusicTrack(livekitRoomName, selectedMusicTrack, musicVolume)

    setIsMusicActionLoading(false)

    if (success) {
      setPlayingMusicTrack(selectedMusicTrack)
      setIsMusicPaused(false)
    } else {
      setUploadError("Could not start music.")
    }
  }

  const handleStopMusic = async () => {
    if (isMusicActionLoading) return

    setUploadError(null)
    setMusicStatusMessage(null)
    setIsMusicActionLoading(true)

    const success = await stopMusicTrack(livekitRoomName)

    setIsMusicActionLoading(false)

    if (success) {
      setPlayingMusicTrack(null)
      setIsMusicPaused(false)
    } else {
      setUploadError("Could not stop music.")
    }
  }

  const handleToggleMusicPaused = async () => {
    if (!playingMusicTrack || isMusicActionLoading) return

    setUploadError(null)
    setMusicStatusMessage(null)
    setIsMusicActionLoading(true)

    const success = isMusicPaused
      ? await resumeMusicTrack(livekitRoomName)
      : await pauseMusicTrack(livekitRoomName)

    setIsMusicActionLoading(false)

    if (success) {
      setIsMusicPaused(!isMusicPaused)
    } else {
      setUploadError(isMusicPaused ? "Could not resume music." : "Could not pause music.")
    }
  }

  const handleAdjustMusicVolume = async (delta: number) => {
    if (isMusicActionLoading) return

    const nextVolume = Math.max(0.05, Math.min(1, Math.round((musicVolume + delta) * 100) / 100))
    if (nextVolume === musicVolume) return

    setMusicVolume(nextVolume)
    setUploadError(null)
    setMusicStatusMessage(`Music volume ${Math.round(nextVolume * 100)}%.`)

    if (!playingMusicTrack) return

    setIsMusicActionLoading(true)
    const success = await setMusicTrackVolume(livekitRoomName, nextVolume)
    setIsMusicActionLoading(false)

    if (!success) {
      setUploadError("Could not update music volume.")
    }
  }

  // Opening the sheet is the earliest moment we know the host is about to
  // want music - kick off the slow part (the bot's LiveKit connection)
  // right now, in the background, instead of waiting for them to actually
  // tap Play. By the time they've picked a track, the connection is
  // typically already warm, so Play only has to start ffmpeg. Also
  // resyncs with whatever the bot is actually doing, in case this host
  // reopened the sheet after navigating away mid-playback.
  const handleOpenMusicSheet = () => {
    hapticMedium()
    closeAllOverlays()
    setActiveSheet("music")
    void warmMusicBot(livekitRoomName)
    void handleCheckMusicStatus()
  }

  const handleCheckMusicStatus = async () => {
    if (isMusicStatusLoading) return

    setUploadError(null)
    setIsMusicStatusLoading(true)

    const status = await getMusicBotStatus(livekitRoomName)

    setIsMusicStatusLoading(false)

    if (!status) {
      setUploadError("Could not check music.")
      return
    }

    if ((status.status === "playing" || status.status === "paused") && status.framesSent > 0 && status.lastFrameAt) {
      setMusicStatusMessage(`${status.paused ? "Paused" : "Playing"} ${status.trackName ?? "track"} at ${Math.round((status.volume ?? musicVolume) * 100)}%.`)
      setIsMusicPaused(status.paused)
      if (typeof status.volume === "number") setMusicVolume(status.volume)
      return
    }

    if (status.status === "error") {
      setUploadError(status.error ?? "Music bot reported an error.")
      return
    }

    if (status.status === "starting") {
      setMusicStatusMessage(`Starting ${status.trackName ?? "track"}...`)
      if (typeof status.volume === "number") setMusicVolume(status.volume)
      return
    }

    setMusicStatusMessage("Music is stopped.")
  }

  const handleDeleteMusicTrack = async (track: MusicTrack) => {
    if (deletingMusicTrackId || isMusicActionLoading) return

    if (playingMusicTrack?.id === track.id) {
      setUploadError("Stop this track before deleting it.")
      return
    }

    setUploadError(null)
    setMusicStatusMessage(null)
    setDeletingMusicTrackId(track.id)

    const success = await deleteMusicTrack(track)

    setDeletingMusicTrackId(null)

    if (success) {
      if (selectedMusicTrack?.id === track.id) {
        setSelectedMusicTrack(null)
      }
      queryClient.invalidateQueries({ queryKey: ["music-tracks"] })
      setMusicStatusMessage("Track deleted.")
    } else {
      setUploadError("Could not delete track.")
    }
  }

  // Track row rendering now lives in components/podcast/musicSheet.tsx.

  const renderParticipantRow = ({ item: participant }: { item: LivePodcastParticipant }) => {
    const participantProfile = participant.profile
    const participantName = participantProfile?.full_name?.trim() || "Unnamed participant"
    const joinedAt = participant.joined_at
      ? new Date(participant.joined_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : null

    return (
      <View className="flex-row items-center rounded-[18px] bg-[#143703] px-4 py-3">
        <HostAvatar
          hostName={participantName}
          hostPictureUrl={participantProfile?.avatar_url ?? null}
          size={40}
          textClassName="text-sm font-bold text-menorah-primary"
        />
        <View className="ml-3 min-w-0 flex-1">
          <Text className="text-[14px] font-semibold text-[#F4F5F0]" numberOfLines={1}>
            {participantName}
          </Text>
          <Text className="mt-1 text-[11px] text-[#B7C0BC]" numberOfLines={1}>
            {joinedAt ? `Joined ${joinedAt}` : "Joined stream"}
          </Text>
        </View>
        <View className={`ml-3 rounded-full px-2.5 py-1 ${participant.is_called_in ? "bg-[#D7FF00]" : "bg-[#D7FF00]/15"}`}>
          <Text className={`text-[10px] font-semibold ${participant.is_called_in ? "text-[#143703]" : "text-[#D7FF00]"}`}>
            {participant.is_called_in ? "Speaker" : "Live"}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <PodcastBackground coverUrl={coverUrl}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4 pt-3">
          <PodcastHeader
            playlist={playlist}
            hostName={hostName}
            hostPictureUrl={hostPictureUrl}
            participantCount={participantCount}
            onInfoPress={() => {
              hapticMedium()
              setActiveSheet("participants")
            }}
            actions={
              <> 
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Pressable onPress={() => { hapticMedium(); setIsNotesVisible(true) }} hitSlop={10}>
                    <HugeIcon width={21} height={21} />
                  </Pressable>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Pressable onPress={() => { hapticMedium(); setIsBibleVisible(true) }} hitSlop={10}>
                    <BookOpen size={19} color="#F3F6E7" strokeWidth={1.4} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {hapticMedium(); shareLivePodcast({
                    hostName, title, podcastId: id, playlist
                  })}}
                  hitSlop={10}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                >
                  <Share2  
                  size={20} 
                  color="#F3F6E7" 
                  strokeWidth={1.2}
                  />
                </Pressable>
                <Pressable
                  onPress={() => { hapticMedium(); setIsExitPromptVisible(true) }}
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#F3523C]/20"
                >
                  <Power size={19} color="#FF5A45" strokeWidth={2} />
                </Pressable>
              </>
            }
          />

          {isRecording ? (
            <View className="absolute right-4 top-[66px] z-10 h-6 flex-row items-center rounded-full bg-[#F3523C]/20 px-2">
              <View className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <Text className="ml-1 text-[8px] font-semibold uppercase text-[#FF8A7A]">
                Rec
              </Text>
            </View>
          ) : null}

          {latestRaisedHand ? (
            <Pressable
              onPress={() => {
                closeAllOverlays();
                setActiveSheet("speakers");
              }}
              className="mb-5 flex-row items-center rounded-[20px] border border-[#D7FF00]/20 bg-[#0F2A08]/90 px-4 py-4"
            >
              <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#D7FF00]/15">
                <Mic size={18} color="#D7FF00" strokeWidth={2.4} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-semibold text-[#F4F5F0]">
                  {latestRaisedHand.fromName} is requesting to call in
                </Text>
                <Text className="mt-1 text-[11px] text-[#B7C0BC]">
                  Tap to review speaker requests.
                </Text>
              </View>
              <View className="ml-3 rounded-full bg-[#D7FF00] px-3 py-1">
                <Text className="text-[11px] font-semibold text-[#143703]">
                  {raisedHands.length}
                </Text>
              </View>
            </Pressable>
          ) : null}

          <PodcastParticipantsGrid
            participants={speakerGridParticipants}
          />

          <PodcastComments
            messages={messages}
            isLoading={isChatLoading}
            footerPadding={scrollPaddingBottom}
            currentUserId={profile?.id}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            canDeleteMessage={canDeleteMessage}
            canEditMessage={canEditMessage}
            onReplyToMessage={(messageId, senderName) => {
              setReplyingTo({ messageId, senderName })
              setIsMessageComposerVisible(true)
            }}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </View>

        <PodcastBottomDock
          bottom={isMessageComposerVisible ? keyboardHeight + 8 : footerBottom}
          paddingBottom={footerPaddingBottom}
          onLayout={handleFooterLayout}
        >
          {isMessageComposerVisible ? (
            <View className="flex-row items-center">
              <View className="mr-4 h-[44px] flex-1 flex-row items-center rounded-[14px] border border-[#ECE8E8]/60 bg-[#143703] px-3">
                <TextInput
                  ref={messageInputRef}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Input your message"
                  placeholderTextColor="#9D9D9D"
                  className="flex-1 text-[13px] text-white"
                  selectionColor="#FFFFFF"
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    handleSendMessage()
                    Keyboard.dismiss();
                    setIsMessageComposerVisible(false);
                  }}
                />
              </View>

              <Pressable 
                hitSlop={10} 
                className="mr-2"
                onPress={() => {
                  hapticMedium()
                  sendImage(profile?.full_name ?? "Admin", profile?.avatar_url ?? null, replyingTo?.messageId)
                }}
                >
                <MaterialCommunityIcons
                  name="image-outline"
                  size={30}
                  color="#F5F2F2"
                />
              </Pressable>

              <Pressable
                hitSlop={10}
                disabled={!canSendMessage}
                onPress={() => {
                  hapticMedium()
                  handleSendMessage()
                  Keyboard.dismiss()
                  setIsMessageComposerVisible(false)
                }}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={30}
                  color={canSendMessage ? "#D7FF00" : "#7E8C83"}
                />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-between px-6">
              <Pressable
                onPress={() => {
                  hapticMedium();
                  closeAllOverlays();
                  setActiveSheet("settings");
                }}
                hitSlop={10}
              >
                <TreeButton width={26} height={26} />
              </Pressable>
              <Pressable
                onPress={handleOpenMusicSheet}
                hitSlop={10}
              >
                <MusicButton width={26} height={26} />
              </Pressable>
              <Pressable
                onPress={() => {
                  hapticMedium();
                  setActiveSheet("none");
                  setIsMessageComposerVisible(true);
                }}
                hitSlop={10}
              >
                <MessagingButton width={26} height={26} />
              </Pressable>
              <Pressable
                onPress={() => {
                  hapticMedium();
                  closeAllOverlays();
                  setActiveSheet("speakers");
                }}
                hitSlop={10}
              >
                <MicrophoneButton width={26} height={26} />
              </Pressable>
            </View>
          )}
        </PodcastBottomDock>

        {speakerLimitMessage ? (
          <View className="absolute left-4 right-4 top-[122px] rounded-[18px] border border-[#D7FF00]/20 bg-[#0F2A08]/95 px-4 py-3">
            <Text className="text-center text-[13px] font-semibold text-[#F4F5F0]">
              {speakerLimitMessage}
            </Text>
          </View>
        ) : null}

        <PodcastBottomSheet
          visible={activeSheet === "settings"}
          onClose={() => setActiveSheet("none")}
        >
          <View className="items-center">
            <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
          </View>

          <Pressable
              onPress={handleToggleRecording}
              disabled={isRecordingActionLoading}
              className="mt-8 flex-row items-center justify-between"
          >
              <Text className="text-[16px] font-medium text-[#F2F5EE]">
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
              {isRecordingActionLoading ? (
                <ActivityIndicator size="small" color="#D7FF00" />
              ) : (
                <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
              )}
          </Pressable>

          <Pressable
            onPress={() => handleBackgroundUpload()}
            className="mt-10 flex-row items-center justify-between"
          >
            <Text className="text-[16px] font-medium text-[#F2F5EE]">Set Background</Text>
            {uploadingBackground ? <ActivityIndicator size="small" color="#D7FF00" /> : <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />}
          </Pressable>
        </PodcastBottomSheet>

        <MusicSheet
          visible={activeSheet === "music"}
          onClose={() => setActiveSheet("none")}
          selectedAssetName={selectedMusicAsset?.name ?? null}
          isUploading={isUploadingMusic}
          uploadedName={uploadedMusicName}
          onPickFile={handleMusicPick}
          onClearPickedFile={() => setSelectedMusicAsset(null)}
          onUpload={handleMusicUpload}
          tracks={musicTracks}
          isLoadingTracks={isLoadingMusicTracks}
          selectedTrack={selectedMusicTrack}
          onSelectTrack={setSelectedMusicTrack}
          deletingTrackId={deletingMusicTrackId}
          onDeleteTrack={handleDeleteMusicTrack}
          playingTrack={playingMusicTrack}
          isPaused={isMusicPaused}
          isActionLoading={isMusicActionLoading}
          onPlay={handlePlayMusic}
          onStop={handleStopMusic}
          onTogglePause={handleToggleMusicPaused}
          volume={musicVolume}
          onSetVolume={(nextVolume) => handleAdjustMusicVolume(nextVolume - musicVolume)}
          statusMessage={musicStatusMessage}
          errorMessage={uploadError}
        />

      <PodcastBottomSheet
        visible={activeSheet === "participants"}
        onClose={() => setActiveSheet("none")}
      >
        <View className="items-center">
          <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View className="min-w-0 flex-1">
            <Text className="text-[18px] font-bold text-[#D7FF00]">
              Live Participants
            </Text>
            <Text className="mt-1 text-[12px] text-[#B7C0BC]">
              {activeAudienceParticipants.length} visible, {participantCount} live now
            </Text>
          </View>
          <Pressable
            onPress={() => {
              hapticMedium()
              void handleRefreshLiveParticipants()
            }}
            disabled={isRefreshingLiveParticipants}
            className="ml-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#143703]"
            accessibilityRole="button"
            accessibilityLabel="Refresh live participants"
          >
            {isRefreshingLiveParticipants ? (
              <ActivityIndicator size="small" color="#D7FF00" />
            ) : (
              <RefreshCw size={18} color="#D7FF00" />
            )}
          </Pressable>
        </View>

        <View className="mt-4 overflow-hidden rounded-[20px]" style={{ height: participantSheetListHeight }}>
          <FlashList
            data={activeAudienceParticipants}
            extraData={liveRoomParticipantIds}
            keyExtractor={(item) => item.id}
            renderItem={renderParticipantRow}
            ItemSeparatorComponent={() => <View className="h-2" />}
            ListEmptyComponent={() => (
              <View className="items-center rounded-[18px] bg-[#143703] px-4 py-8">
                {isLoadingActiveParticipants ? (
                  <ActivityIndicator size="small" color="#D7FF00" />
                ) : (
                  <Text className="text-center text-[13px] text-[#B7C0BC]">
                    No live participants yet.
                  </Text>
                )}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator
            refreshing={isRefreshingLiveParticipants}
            onRefresh={() => {
              void handleRefreshLiveParticipants()
            }}
          />
        </View>
      </PodcastBottomSheet>

      <PodcastBottomSheet
          visible={activeSheet === "speakers"}
          onClose={() => setActiveSheet("none")}
        >
          <View className="items-center">
            <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
          </View>

          <Text className="mt-8 text-center text-[18px] font-bold text-[#D7FF00]">
            Speakers & Requests
          </Text>

          <Text className="mt-8 text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
            Call-in Requests
          </Text>

          {raisedHands.length ? (
            <View className="mt-4 gap-4">
              {raisedHands.map((request) => {
                const isApprovingRequest = approvingRequests.has(request.fromId)
                const speakerLimitReached = activeGuestSpeakerCount >= MAX_GUEST_SPEAKERS

                return (
                  <View
                    key={request.fromId}
                    className="rounded-[22px] bg-[#143703] px-4 py-4"
                  >
                    <Text className="text-[16px] font-semibold text-[#F4F5F0]">
                      {request.fromName}
                    </Text>
                    <Text className="mt-1 text-[12px] text-[#B7C0BC]">
                      Wants to call in and join as a speaker.
                    </Text>
                    <View className="mt-4 flex-row gap-3">
                      <Pressable
                        onPress={() => handleApproveRaisedHand(request.fromId)}
                        disabled={isApprovingRequest || speakerLimitReached}
                        className={`flex-1 items-center rounded-[16px] px-4 py-3 ${
                          isApprovingRequest
                            ? "bg-[#D7FF00]/70"
                            : speakerLimitReached
                              ? "bg-[#184832]"
                              : "bg-[#D7FF00]"
                        }`}
                      >
                        {isApprovingRequest ? (
                          <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#143703" />
                            <Text className="ml-2 text-[14px] font-semibold text-[#143703]">Approving...</Text>
                          </View>
                        ) : (
                          <Text className={`text-[14px] font-semibold ${speakerLimitReached ? "text-[#8A9A90]" : "text-[#143703]"}`}>
                            Accept
                          </Text>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => handleRejectRaisedHand(request.fromId)}
                        disabled={isApprovingRequest}
                        className="flex-1 items-center rounded-[16px] bg-white/10 px-4 py-3"
                      >
                        <Text className="text-[14px] font-semibold text-[#F4F5F0]">Reject</Text>
                      </Pressable>
                    </View>
                    {speakerLimitReached ? (
                      <Text className="mt-3 text-[11px] text-[#D7FF00]">
                        Speaker slots are full.
                      </Text>
                    ) : null}
                  </View>
                )
              })}
            </View>
          ) : (
            <View className="mt-4 rounded-[22px] bg-[#143703] px-4 py-4">
              <Text className="text-[14px] text-[#B7C0BC]">No call-in requests right now.</Text>
            </View>
          )}

          <Text className="mt-8 text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
            Active Speakers
          </Text>

          <View className="mt-4 gap-4">
            {speakerRows.map((speaker) => (
              (() => {
                const isRemovingSpeaker = removingSpeakers.has(speaker.id)
                const isMutingSpeaker = mutingSpeakers.has(speaker.id)

                return (
              <View
                key={speaker.id}
                className="flex-row items-center rounded-[22px] bg-[#143703] px-4 py-4"
              >
                <HostAvatar
                  hostName={speaker.name}
                  hostPictureUrl={speaker.avatarUrl}
                  size={42}
                  textClassName="text-base font-bold text-menorah-primary"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-semibold text-[#F4F5F0]">
                    {speaker.name}
                  </Text>
                  <Text className="mt-1 text-[12px] text-[#B7C0BC]">
                    {speaker.isHost ? "Host" : "Speaker"}
                  </Text>
                </View>
                {speaker.isHost ? (
                  <Pressable
                    onPress={handleToggleMic}
                    className="flex-row items-center rounded-full bg-menorah-darkGreen px-3 py-2"
                  >
                    {speaker.isMuted ? (
                      <MicOff size={18} color={Colors.menorah.primary} />
                    ) : (
                      <Mic size={18} color={Colors.menorah.primary} />
                    )}
                    <Text className="ml-2 text-[12px] font-semibold text-[#F4F5F0]">
                      {speaker.isMuted ? "Muted" : "Live"}
                    </Text>
                  </Pressable>
                ) : (
                  <View className="items-end gap-2">
                    <Pressable
                      onPress={() => handleMuteSpeaker(speaker.id, speaker.audioTrackSid)}
                      disabled={speaker.isMuted || isMutingSpeaker || !speaker.audioTrackSid}
                      className={`flex-row items-center rounded-full px-3 py-2 ${
                        speaker.isMuted || !speaker.audioTrackSid ? "bg-white/10" : "bg-[#D7FF00]/15"
                      }`}
                    >
                      {isMutingSpeaker ? (
                        <ActivityIndicator size="small" color="#D7FF00" />
                      ) : speaker.isMuted ? (
                        <MicOff size={18} color="#F3F6E7" />
                      ) : (
                        <Mic size={18} color="#D7FF00" />
                      )}
                      <Text className="ml-2 text-[12px] font-semibold text-[#F4F5F0]">
                        {isMutingSpeaker ? "Muting" : speaker.isMuted ? "Muted" : "Mute"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveSpeaker(speaker.id)}
                      disabled={isRemovingSpeaker}
                      className="rounded-full bg-[#F3523C]/15 px-3 py-2"
                    >
                      {isRemovingSpeaker ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#FF8A7A" />
                          <Text className="ml-2 text-[11px] font-semibold text-[#FF8A7A]">
                            Removing
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-[11px] font-semibold text-[#FF8A7A]">
                          Remove
                        </Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
                )
              })()
            ))}
          </View>
        </PodcastBottomSheet>

        <PodcastDialog
          visible={isExitPromptVisible}
          onClose={() => setIsExitPromptVisible(false)}
        >
          <View className="w-full max-w-[360px] overflow-hidden rounded-[20px] bg-[#014C22]">
            <Pressable
              onPress={() => setIsExitPromptVisible(false)}
              className="absolute right-5 top-5 z-10"
              hitSlop={12}
            >
              <X size={25} color="#F5F5F5" strokeWidth={2.4} />
            </Pressable>

            <View className="px-7 pb-5 pt-10">
              <Text className="text-center text-[18px] font-semibold text-[#D7FF00]">
                Exit The Live Room?
              </Text>
              <Text className="mt-9 text-center text-[14px] text-[#95A89C]">
                Are you sure you want to exit the live {"\n"} room?
              </Text>
            </View>

            <View className="flex-row">
              <Pressable
                onPress={() => { hapticMedium(); leaveLiveRoom() }}
                className="flex-1 items-center justify-center bg-[#D7FF00] px-4 py-4"
              >
                {isEndingSession ? (
                  <View className="pointer-events-none animate-spin">
                    <Icon as={Loader2} color={Colors.menorah.bg} />
                  </View>
                ) : (
                  <Text className="text-[18px] font-medium text-black">End session</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => { hapticMedium(); setIsExitPromptVisible(false) }}
                className="flex-1 items-center justify-center bg-[#01411D] px-4 py-4"
              >
                <Text className="text-[18px] font-medium text-[#D7FF00]">Stay</Text>
              </Pressable>
            </View>
          </View>
        </PodcastDialog>

        <PodcastNotesDialog
          visible={isNotesVisible}
          onClose={() => setIsNotesVisible(false)}
          playlist={playlist}
          title={title}
        />

        <BibleReader
          visible={isBibleVisible}
          onClose={() => setIsBibleVisible(false)}
          bookId={bibleBookId}
          chapter={bibleChapter}
          onNavigate={(nextBookId, nextChapter) => {
            setBibleBookId(nextBookId)
            setBibleChapter(nextChapter)
          }}
          isHost
          onShare={
            room && profile
              ? (sharedBookId, sharedChapter) =>
                  sendBibleNavigation(room, profile.id, profile.full_name ?? "Host", sharedBookId, sharedChapter, "web")
              : undefined
          }
        />

      <PodcastConnectingOverlay
          visible={shouldShowConnectingOverlay && isConnecting}
        />
      </SafeAreaView>
    </PodcastBackground>
  );
};

export default AdminLivePodcast;
