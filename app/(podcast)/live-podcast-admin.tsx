import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import {
  HostAvatar,
  PodcastBackground,
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastConnectingOverlay,
  PodcastDialog,
  PodcastHeader,
  PodcastNotesDialog,
  PodcastParticipantsGrid,
  usePodcastFooterLayout,
} from "@/components/podcast/livePodcastShared";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useHostRooom } from "@/hooks/useHostRoom";
import { useLiveRoomSnapshot } from "@/hooks/useLiveRoomSnapshot";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { hapticMedium } from "@/lib/haptics";
import { approveSpeaker, revokeSpeaker, sendBackgroundChangedSignal, sendSessionEnded } from "@/lib/livekit-signals";
import { endLiveSession, updateParticipantCalledIn } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { startRecording, stopRecording } from "@/lib/recording";
import { pickAudioFile, pickImage, uploadPodcastBackground } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore";
import { useLiveKitStore } from "@/store/livekit-store";
import { AudioPickerAsset } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, CheckCircle2, ChevronRight, FileAudio, Loader2, Mic, MicOff, Music2, Power, Share2, SlidersHorizontal, Upload, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  PanResponder,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadMusicTrack } from "@/lib/music";
import { useBackgoundMusicQuery } from "@/hooks/tanstack-query-hooks";
import { shareLivePodcast } from "@/lib/share";

type AdminSheet = "none" | "settings" | "music" | "speakers";

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
  const { footerBottom, footerPaddingBottom, scrollPaddingBottom, handleFooterLayout } =
    usePodcastFooterLayout();

  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
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
  const [egressId, setEgressId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [hasRequestedRecording, setHasRequestedRecording] = useState(false)
  const [isRecordingActionLoading, setIsRecordingActionLoading] = useState(false)
  const [musicSliderWidth, setMusicSliderWidth] = useState(0)
  const [musicVolume, setMusicVolume] = useState(0.7)
  const [selectedMusicAsset, setSelectedMusicAsset] = useState<AudioPickerAsset | null>(null)
  const [uploadedMusicName, setUploadedMusicName] = useState<string | null>(null)
  const [isUploadingMusic, setIsUploadingMusic] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const room = useLiveKitStore(state => state.room)
  const isMuted = useLiveKitStore(state => state.isMuted)
  const setIsMuted = useLiveKitStore(state => state.setIsMuted)
  const clearRoom = useLiveKitStore(state => state.clearRoom)
  const connectionState = useLiveKitStore(state => state.connectionState)

  const profile = useAuthStore(state => state.profile)
  const { data: musicTracks = [], isLoading: isLoadingMusicTracks } = useBackgoundMusicQuery()

  const isConnecting = connectionState !== 'connected'

  const clamp = (value: number) => Math.min(1, Math.max(0, value))

  const updateMusicVolume = useCallback((locationX: number) => {
    if (!musicSliderWidth) return
    setMusicVolume(clamp(locationX / musicSliderWidth))
  }, [musicSliderWidth])

  const formatFileSize = (size: number) => {
    if (!size) return "Unknown size"
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const musicSliderPanResponder = useMemo(
      () =>
          PanResponder.create({
              onStartShouldSetPanResponder: () => true,

              onMoveShouldSetPanResponder: () => true,

              onPanResponderGrant: (event) => {
                  updateMusicVolume(event.nativeEvent.locationX)
              },

              onPanResponderMove: (event) => {
                  updateMusicVolume(event.nativeEvent.locationX)
              },
          }),
      [updateMusicVolume]
  )

  useFocusEffect(
    useCallback(() => {
      setShouldShowConnectingOverlay(true);

      return () => {
        setShouldShowConnectingOverlay(false);
      };
    }, [])
  );
  
  useHostRooom(livekitRoomName)
  const { participants: roomParticipants } = useLiveRoomSnapshot(room)

  const {raisedHands, dismissRaisedHand} = useRoomSignals(room, profile?.id ?? "")
  const {messages, sendMessage, sendImage} = useRoomChat(
    room,
    id,
    profile?.id ?? ''
  )
  const latestRaisedHand = raisedHands[raisedHands.length - 1]
  const participantCount = roomParticipants.filter((participant) => participant.id !== hostId).length

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
    await sendMessage(message, profile?.full_name ?? "User", profile?.avatar_url ?? null)
    setMessage('')
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

        if (isRecording && egressId) {
          await stopRecording(egressId, id)
        }

        // await stopMusic()
        const success = await endLiveSession(id)
        if (!success) {
            console.error('Failed to end live session in backend')
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

    await room.localParticipant.setMicrophoneEnabled(!newMutedState)

    setIsMuted(newMutedState)
  }

  const hostSnapshot = roomParticipants.find((participant) => participant.id === hostId)

  const speakerRows = [
    {
      id: hostId,
      name: hostName,
      avatarUrl: hostPictureUrl ?? null,
      isMuted,
      isHost: true,
      isSpeaking: hostSnapshot?.isSpeaking ?? false,
      audioLevel: hostSnapshot?.audioLevel ?? 0,
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
      }))
  ]

  const speakerGridParticipants = speakerRows.map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    pictureUrl: speaker.avatarUrl,
    isSpeaking: speaker.isSpeaking,
    audioLevel: speaker.audioLevel,
  }))

  const handleApproveRaisedHand = async (participantId: string) => {
    if (!room || !profile || approvingRequests.has(participantId)) return

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
    if (!room || !profile) return

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
      if (isRecording && egressId) {
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
      setSelectedMusicAsset(null)
      queryClient.invalidateQueries({ queryKey: ["music-tracks"] })
    } else {
      setUploadError("Failed to upload track. Please try again.")
    }
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
            actions={
              <> 
                <View className="ml-3 flex-row items-center gap-2">
                  {isRecording && (
                  <View className="w-3 h-3 rounded-full bg-red-500" />
              )}
                  <Pressable onPress={() => { hapticMedium(); setIsNotesVisible(true) }} hitSlop={10}>
                    <HugeIcon width={30} height={30} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {hapticMedium(); shareLivePodcast({
                    hostName, title, podcastId: id, playlist
                  })}}
                  hitSlop={10}
                >
                  <Share2  
                  size={25} 
                  color="#F3F6E7" 
                  strokeWidth={1.2}
                  />
                </Pressable>
                <Pressable
                  onPress={() => { hapticMedium(); setIsExitPromptVisible(true) }}
                  className="rounded-full bg-[#F3523C]/20 p-2"
                >
                  <Power size={23} color="#FF5A45" strokeWidth={2} />
                </Pressable>
              </>
            }
          />

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

          <PodcastComments messages={messages} footerPadding={scrollPaddingBottom} />
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
                  sendImage(profile?.full_name ?? "Admin", profile?.avatar_url ?? null)
                }}
                >
                <MaterialCommunityIcons
                  name="image-outline"
                  size={30}
                  color="#F5F2F2"
                />
              </Pressable>

              <Pressable hitSlop={10}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={30}
                  color="#F5F2F2"
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
                onPress={() => {
                  hapticMedium();
                  closeAllOverlays();
                  setActiveSheet("music");
                }}
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

        <PodcastBottomSheet
          visible={activeSheet === "music"}
          onClose={() => setActiveSheet("none")}
          >
          <View className="items-center mb-2">
              <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
          </View>

          <View className="mt-5 flex-row items-center">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-[#D7FF00]/15">
              <Music2 size={22} color="#D7FF00" strokeWidth={2.2} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[18px] font-bold text-[#F2F5EE]">
                Music Library
              </Text>
              <Text className="mt-1 text-[12px] text-[#B7C0BC]">
                Upload audio files for this live podcast workspace.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleMusicPick}
            disabled={isUploadingMusic}
            className="mt-6 items-center rounded-[22px] border border-dashed border-[#D7FF00]/45 bg-[#143703]/85 px-5 py-6"
          >
            <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-[#D7FF00]">
              <FileAudio size={25} color="#143703" strokeWidth={2.3} />
            </View>
            <Text className="mt-4 text-center text-[15px] font-semibold text-[#F2F5EE]">
              {selectedMusicAsset ? "Change selected audio" : "Choose audio document"}
            </Text>
            <Text className="mt-2 text-center text-[12px] leading-5 text-[#B7C0BC]">
              Supports audio files from the device document picker.
            </Text>
          </Pressable>

          {selectedMusicAsset ? (
            <View className="mt-4 rounded-[18px] bg-[#0F2A08] px-4 py-4">
              <View className="flex-row items-center">
                <View className="h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#D7FF00]/15">
                  <FileAudio size={18} color="#D7FF00" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[14px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
                    {selectedMusicAsset.name}
                  </Text>
                  <Text className="mt-1 text-[11px] text-[#B7C0BC]">
                    {formatFileSize(selectedMusicAsset.size)} | {selectedMusicAsset.mimeType}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedMusicAsset(null)}
                  disabled={isUploadingMusic}
                  hitSlop={10}
                  className="ml-2 rounded-full bg-white/10 p-2"
                >
                  <X size={16} color="#F2F5EE" />
                </Pressable>
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={handleMusicUpload}
            disabled={isUploadingMusic || !selectedMusicAsset}
            className={`mt-4 flex-row items-center justify-center rounded-[16px] px-4 py-4 ${
              selectedMusicAsset && !isUploadingMusic ? "bg-[#D7FF00]" : "bg-[#184832]"
            }`}
          >
            {isUploadingMusic ? (
              <>
                <ActivityIndicator size="small" color="#143703" />
                <Text className="ml-2 text-[14px] font-semibold text-[#143703]">
                  Uploading to Supabase...
                </Text>
              </>
            ) : (
              <>
                <Upload size={17} color={selectedMusicAsset ? "#143703" : "#8A9A90"} />
                <Text
                  className={`ml-2 text-[14px] font-semibold ${
                    selectedMusicAsset ? "text-[#143703]" : "text-[#8A9A90]"
                  }`}
                >
                  Upload Track
                </Text>
              </>
            )}
          </Pressable>

          {uploadedMusicName ? (
            <View className="mt-4 flex-row items-center rounded-[16px] bg-[#D7FF00]/12 px-4 py-3">
              <CheckCircle2 size={18} color="#D7FF00" />
              <Text className="ml-2 flex-1 text-[12px] text-[#D7FF00]" numberOfLines={1}>
                Uploaded {uploadedMusicName}
              </Text>
            </View>
          ) : null}

          {uploadError ? (
            <View className="mt-4 flex-row items-center rounded-[16px] bg-[#F3523C]/12 px-4 py-3">
              <AlertCircle size={18} color="#FF8A7A" />
              <Text className="ml-2 flex-1 text-[12px] text-[#FF8A7A]">
                {uploadError}
              </Text>
            </View>
          ) : null}

          <View className="mt-7">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <SlidersHorizontal size={17} color="#B7C0BC" />
                <Text className="ml-2 text-[13px] font-semibold text-[#B7C0BC]">
                  Volume
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-[#D7FF00]">
                {Math.round(musicVolume * 100)}%
              </Text>
            </View>

            <View
              className="justify-center py-4"
              onLayout={(e) => setMusicSliderWidth(e.nativeEvent.layout.width)}
              {...musicSliderPanResponder.panHandlers}
            >
              <View className="h-[7px] rounded-full bg-[#184832]" />
              <View
                className="absolute h-[7px] rounded-full bg-[#D7FF00]"
                style={{ width: `${musicVolume * 100}%` }}
              />
              <View
                className="absolute h-[24px] w-[24px] rounded-full border-[3px] border-[#143703] bg-[#D7FF00]"
                style={{ left: `${musicVolume * 100}%`, marginLeft: -12 }}
              />
            </View>
          </View>

          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
                Uploaded Tracks
              </Text>
              <Text className="text-[12px] text-[#D7FF00]">
                {musicTracks.length}
              </Text>
            </View>

            {isLoadingMusicTracks ? (
              <View className="items-center rounded-[18px] bg-[#143703] px-4 py-5">
                <ActivityIndicator size="small" color="#D7FF00" />
              </View>
            ) : musicTracks.length ? (
              <View className="gap-2">
                {musicTracks.slice(0, 4).map((track) => (
                  <View
                    key={track.id}
                    className="flex-row items-center rounded-[16px] bg-[#143703] px-4 py-3"
                  >
                    <View className="h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-[#D7FF00]/15">
                      <Music2 size={15} color="#D7FF00" />
                    </View>
                    <Text className="ml-3 flex-1 text-[13px] font-medium text-[#F2F5EE]" numberOfLines={1}>
                      {track.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="rounded-[18px] bg-[#143703] px-4 py-5">
                <Text className="text-center text-[13px] text-[#B7C0BC]">
                  No music tracks uploaded yet.
                </Text>
              </View>
            )}
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
              {raisedHands.map((request) => (
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
                      disabled={approvingRequests.has(request.fromId)}
                      className={`flex-1 items-center rounded-[16px] px-4 py-3 ${
                        approvingRequests.has(request.fromId)
                          ? 'bg-[#D7FF00]/70'
                          : 'bg-[#D7FF00]'
                      }`}
                    >
                      {approvingRequests.has(request.fromId) ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#143703" />
                          <Text className="ml-2 text-[14px] font-semibold text-[#143703]">Approving...</Text>
                        </View>
                      ) : (
                        <Text className="text-[14px] font-semibold text-[#143703]">Accept</Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleRejectRaisedHand(request.fromId)}
                      disabled={approvingRequests.has(request.fromId)}
                      className="flex-1 items-center rounded-[16px] bg-white/10 px-4 py-3"
                    >
                      <Text className="text-[14px] font-semibold text-[#F4F5F0]">Reject</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
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
                    <View className="flex-row items-center rounded-full bg-white/10 px-3 py-2">
                      {speaker.isMuted ? (
                        <MicOff size={18} color="#F3F6E7" />
                      ) : (
                        <Mic size={18} color="#D7FF00" />
                      )}
                      <Text className="ml-2 text-[12px] font-semibold text-[#F4F5F0]">
                        {speaker.isMuted ? "Muted" : "Live"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveSpeaker(speaker.id)}
                      className="rounded-full bg-[#F3523C]/15 px-3 py-2"
                    >
                      <Text className="text-[11px] font-semibold text-[#FF8A7A]">
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
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

        <PodcastConnectingOverlay
          visible={shouldShowConnectingOverlay && isConnecting}
        />
      </SafeAreaView>
    </PodcastBackground>
  );
};

export default AdminLivePodcast;
