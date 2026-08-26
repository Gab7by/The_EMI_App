import Call from "@/assets/svgs/call_icon.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MoneyIcon from "@/assets/svgs/send_money_icon.svg";
import {
  HostAvatar,
  MAX_GUEST_SPEAKERS,
  PodcastBackground,
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastConnectingOverlay,
  PodcastDialog,
  PodcastFullScreenModal,
  PodcastHeader,
  PodcastNotesDialog,
  PodcastParticipantsGrid,
  podcastCurrencies,
  podcastPaymentMethods,
  renderPaymentMethodIcon,
  SPEAKER_LIMIT_MESSAGE,
  usePodcastFooterLayout,
  type PodcastCurrencyOption
} from "@/components/podcast/livePodcastShared";
import { BibleReader } from "@/components/podcast/bibleReader";
import { useAudienceRoom } from "@/hooks/useAudienceRoom";
import { useLiveRoomSnapshot } from "@/hooks/useLiveRoomSnapshot";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { hapticMedium } from "@/lib/haptics";
import { PODCAST_MIC_CAPTURE_OPTIONS } from "@/lib/livekit-audio";
import { ensureMicrophonePermission } from "@/lib/permissions";
import { lowerHand, raiseHand, revokeOwnSpeaker, sendLoveSignal } from "@/lib/livekit-signals";
import { getLivePodcastStatus, joinLivePodcastParticipant, leaveLivePodcastParticipant, updateParticipantCalledIn } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { shareLivePodcast } from "@/lib/share";
import { useAuthStore } from "@/store/authStore";
import { useLiveKitStore } from "@/store/livekit-store";
import type { LoveBurst } from "@/types/livekit-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Power, Share2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Easing, Keyboard, Linking, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MemberLivePodcast = () => {
  const { id, title, playlist, hostId, hostName, hostPictureUrl, livekitRoomName, coverImageUrl } = useLocalSearchParams<{
    id: string;
    title: string;
    hostId: string;
    hostName: string;
    hostPictureUrl: string;
    playlist: string;
    livekitRoomName: string;
    coverImageUrl?: string
  }>();

  const router = useRouter();
  const { footerBottom, footerPaddingBottom, scrollPaddingBottom, handleFooterLayout } =
    usePodcastFooterLayout();

  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isBibleVisible, setIsBibleVisible] = useState(false);
  const [bibleBookId, setBibleBookId] = useState<string | null>(null);
  const [bibleChapter, setBibleChapter] = useState<number | null>(null);
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  const [isCurrencySheetVisible, setIsCurrencySheetVisible] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] =
    useState<PodcastCurrencyOption["id"]>("usd");
  const [message, setMessage] = useState<string>('')
  const [shouldShowConnectingOverlay, setShouldShowConnectingOverlay] = useState(true)
  const [localLoveBursts, setLocalLoveBursts] = useState<LoveBurst[]>([])
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isCallActionLoading, setIsCallActionLoading] = useState(false)
  const [hasHungUpSpeaker, setHasHungUpSpeaker] = useState(false)
  const [speakerLimitMessage, setSpeakerLimitMessage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; senderName: string } | null>(null)

  const selectedCurrency = useMemo(
    () =>
      podcastCurrencies.find((currency) => currency.id === selectedCurrencyId) ??
      podcastCurrencies[1],
    [selectedCurrencyId]
  );

  const clearRoom = useLiveKitStore(state => state.clearRoom)
  const room = useLiveKitStore(state => state.room)
  const connectionState = useLiveKitStore(state => state.connectionState)
  const isMuted = useLiveKitStore(state => state.isMuted)
  const setIsMuted = useLiveKitStore(state => state.setIsMuted)
  const setForegroundServiceType = useLiveKitStore(state => state.setForegroundServiceType)
  const profile = useAuthStore(state => state.profile)
  const {isApprovedToSpeak, sessionEnded, isSpeakerRevoked, backgroundUrl, loveBursts, bibleNavigation, dismissLoveBurst} = useRoomSignals(room, profile?.id ?? "")
  const [hasRaisedHand, setHasRaisedHand] = useState<boolean>(false)
  const canSpeak = isApprovedToSpeak && !hasHungUpSpeaker
  const isConnecting = connectionState !== "connected"

  useAudienceRoom(livekitRoomName, id)

  const {messages, isLoading: isChatLoading, sendMessage, editMessage, deleteMessage, canDeleteMessage, canEditMessage} = useRoomChat(
    room,
    id,
    profile?.id ?? '',
    profile?.role
  )

  // The host persists join/leave events. Members only render the resulting
  // CHAT event, avoiding a duplicate system message from every client.
  const handleParticipantChange = useCallback((_action: 'joined' | 'left', _participantId: string, _participantName: string) => {}, [])

  const { participants: roomParticipants } = useLiveRoomSnapshot(room, handleParticipantChange)
  const participantCount = roomParticipants.filter((participant) => participant.id !== hostId).length
  const activeCoverUrl = backgroundUrl ?? coverImageUrl ?? null
  const hostSnapshot = roomParticipants.find((participant) => participant.id === hostId)

  const speakerGridParticipants = useMemo(
    () => [
      {
        id: hostId,
        name: hostName,
        pictureUrl: hostPictureUrl ?? null,
        isSpeaking: hostSnapshot?.isSpeaking ?? false,
        audioLevel: hostSnapshot?.audioLevel ?? 0,
      },
      ...roomParticipants
        .filter((participant) => participant.id !== hostId && participant.canPublish)
        .map((participant) => ({
          id: participant.id,
          name: participant.isLocal ? profile?.full_name ?? participant.name : participant.name,
          pictureUrl: participant.isLocal ? profile?.avatar_url ?? null : null,
          isSpeaking: participant.isSpeaking,
          audioLevel: participant.audioLevel,
        })),
    ],
    [roomParticipants, hostId, hostName, hostPictureUrl, hostSnapshot?.isSpeaking, hostSnapshot?.audioLevel, profile?.full_name, profile?.avatar_url]
  );

  const activeGuestSpeakerCount = useMemo(
    () => roomParticipants.filter((participant) => participant.id !== hostId && participant.canPublish).length,
    [hostId, roomParticipants]
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

  const visibleLoveBursts = useMemo(() => {
    const byId = new Map<string, LoveBurst>()

    loveBursts.forEach((love) => byId.set(love.id, love))
    localLoveBursts.forEach((love) => byId.set(love.id, love))

    return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt)
  }, [localLoveBursts, loveBursts])

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setShouldShowConnectingOverlay(true)

      const verifySession = async () => {
        const status = await getLivePodcastStatus(id)

        if (status === "ended") {
          if (profile?.id) {
            await leaveLivePodcastParticipant(id, profile.id)
          }
          await room?.localParticipant.setMicrophoneEnabled(false)
          clearRoom()
          router.replace("/(tabs)/podcast")
        }
      }

      verifySession()

      return () => {
        setShouldShowConnectingOverlay(false)
      }
    }, [id, profile?.id, clearRoom, router])
  )

  const handleSendMessage = async () => {
    if (!message.trim()) return
    const result = await sendMessage(message, profile?.full_name ?? "User", profile?.avatar_url ?? null, replyingTo?.messageId)
    if (result.ok) {
      setMessage('')
      setReplyingTo(null)
    }
  }
  const canSendMessage = message.trim().length > 0

  useEffect(() => {
    if (!isApprovedToSpeak || !room || hasHungUpSpeaker) return

    let cancelled = false

    ensureMicrophonePermission().then((granted) => {
      if (cancelled) return

      if (!granted) {
        console.error("Microphone permission denied - cannot enable speaker microphone")
        return
      }

      return room.localParticipant
        .setMicrophoneEnabled(true, PODCAST_MIC_CAPTURE_OPTIONS)
        .then(() => {
          if (cancelled) return
          setIsMuted(false)
          setForegroundServiceType("microphone")
          setHasRaisedHand(false)
          setHasHungUpSpeaker(false)
          queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
        })
    }).catch((error) => {
      console.error("Failed to enable speaker microphone", error)
    })

    return () => {
      cancelled = true
    }
  }, [hasHungUpSpeaker, id, isApprovedToSpeak, room, setForegroundServiceType, setIsMuted])

  useEffect(() => {
    if (!isSpeakerRevoked || !room) return

    room.localParticipant
      .setMicrophoneEnabled(false)
      .then(() => {
        setIsMuted(true)
        setForegroundServiceType("mediaPlayback")
        setHasRaisedHand(false)
        setHasHungUpSpeaker(false)
        queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
      })
      .catch((error) => {
        console.error("Failed to disable revoked speaker microphone", error)
      })
  }, [isSpeakerRevoked, room, setForegroundServiceType, setIsMuted, id])

  useEffect(() => {
    if (!bibleNavigation) return

    setBibleBookId(bibleNavigation.bookId)
    setBibleChapter(bibleNavigation.chapter)
    setIsBibleVisible(true)
  }, [bibleNavigation])

  useEffect(() => {
    if (connectionState !== "connected" || !profile?.id) return

    joinLivePodcastParticipant(id, profile.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["live-podcast-participants", id, hostId] })
      queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
    })
  }, [connectionState, profile?.id, id, hostId])

  useEffect(() => {
    if (!sessionEnded) return
    if (profile?.id) {
      leaveLivePodcastParticipant(id, profile.id)
    }
    room?.localParticipant.setMicrophoneEnabled(false)
    clearRoom()
    router.replace("/(tabs)/podcast")
  }, [sessionEnded, profile?.id, id])

  const handleRaiseHand = async () => {
    if (!room || !profile || isCallActionLoading) return

    if (!canSpeak && !hasRaisedHand && activeGuestSpeakerCount >= MAX_GUEST_SPEAKERS) {
      hapticMedium()
      showSpeakerLimitMessage()
      return
    }

    setIsCallActionLoading(true)

    try {
      if (canSpeak) {
        const nextMutedState = !isMuted

        if (!nextMutedState) {
          const granted = await ensureMicrophonePermission()
          if (!granted) {
            console.error("Microphone permission denied - cannot unmute")
            return
          }
        }

        await room.localParticipant.setMicrophoneEnabled(
          !nextMutedState,
          !nextMutedState ? PODCAST_MIC_CAPTURE_OPTIONS : undefined
        )
        setIsMuted(nextMutedState)
        setForegroundServiceType(nextMutedState ? "mediaPlayback" : "microphone")
        return
      }

      if (hasRaisedHand) {
        await lowerHand(room, profile.id, profile.full_name ?? "Listener")
        setHasRaisedHand(false)
      } else {
        await raiseHand(room, profile.id, profile.full_name ?? "Listener")
        setHasRaisedHand(true)
        setHasHungUpSpeaker(false)
      }
    } finally {
      setIsCallActionLoading(false)
    }
  }

  const handleHangUpSpeaker = async () => {
    if (!room || !profile || isCallActionLoading) return

    hapticMedium()
    setIsCallActionLoading(true)

    try {
      const revoked = await revokeOwnSpeaker(
        room,
        profile.id,
        profile.full_name ?? "Listener",
        livekitRoomName,
        id
      )

      if (!revoked) return

      await room.localParticipant.setMicrophoneEnabled(false)
      setIsMuted(true)
      setForegroundServiceType("mediaPlayback")
      setHasRaisedHand(false)
      setHasHungUpSpeaker(true)
      await updateParticipantCalledIn(id, profile.id, false)
      queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
    } catch (error) {
      console.error("Failed to hang up speaker:", error)
    } finally {
      setIsCallActionLoading(false)
    }
  }

  const handleSendLove = async () => {
    if (!room || !profile) return

    hapticMedium()
    const loveId = await sendLoveSignal(room, profile.id, profile.full_name ?? "Listener")
    setLocalLoveBursts(prev => [
      ...prev.slice(-4),
      {
        id: loveId,
        fromId: profile.id,
        fromName: profile.full_name ?? "Listener",
        createdAt: Date.now(),
      },
    ])
  }

  const dismissVisibleLoveBurst = useCallback((loveId: string) => {
    dismissLoveBurst(loveId)
    setLocalLoveBursts(prev => prev.filter(love => love.id !== loveId))
  }, [dismissLoveBurst])

  const redirectToPaymentPage = useCallback(async () => {
    try {
      console.log(process.env.EXPO_PUBLIC_PAYSTACK_PAYMENT_URL)
      await Linking.openURL(process.env.EXPO_PUBLIC_PAYSTACK_PAYMENT_URL!)
    } catch(e) {
      console.log(e)
      Alert.alert("Something went wrong, Please try again later")
    }
  }, [])

  return (
    <PodcastBackground coverUrl={activeCoverUrl}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4 pt-3">
          <PodcastHeader
            playlist={playlist}
            hostName={hostName}
            hostPictureUrl={hostPictureUrl}
            participantCount={participantCount}
            actions={
              <>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Pressable onPress={() => { hapticMedium(); setIsNotesVisible(true) }} hitSlop={10}>
                    <HugeIcon width={21} height={21} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => { hapticMedium(); setIsBibleVisible(true) }}
                  hitSlop={10}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                >
                  <BookOpen size={19} color="#F3F6E7" strokeWidth={1.4} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    hapticMedium()
                    shareLivePodcast({ hostName, title, podcastId: id, playlist })
                  }}
                  hitSlop={10}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                >
                  <Share2 size={20} color="#F3F6E7" strokeWidth={1.2} />
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
            }}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </View>

        <PodcastBottomDock
          bottom={keyboardHeight > 0 ? keyboardHeight + 8 : footerBottom}
          paddingBottom={footerPaddingBottom}
          onLayout={handleFooterLayout}
        >
          <View className="mb-1 flex-row items-center">
            <View className="mr-2 h-[44px] flex-1 flex-row items-center rounded-[14px] border border-white/55 bg-[#143703] px-3">
              <TextInput
                placeholder="Input your message"
                value={message}
                onChangeText={setMessage}
                placeholderTextColor="#A9A9A9"
                className="flex-1 text-[12px] text-white"
                returnKeyType="send"
                onSubmitEditing={() => {
                  handleSendMessage()
                }}
              />
              <Pressable
                onPress={() => {
                  hapticMedium()
                  handleSendMessage()
                }}
                disabled={!canSendMessage}
                hitSlop={8}
                className="ml-2 h-8 w-8 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons
                  name="send"
                  size={21}
                  color={canSendMessage ? "#D7FF00" : "#7E8C83"}
                />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable onPress={handleSendLove} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <MaterialCommunityIcons name="heart" size={22} color="#FF4B1F" />
              </Pressable>
              <Pressable
                onPress={() => { hapticMedium(); handleRaiseHand() }}
                disabled={isCallActionLoading}
                hitSlop={8}
                className="h-10 min-w-[48px] items-center justify-center rounded-[12px] bg-white/10 px-1"
              >
                {isCallActionLoading ? (
                  <ActivityIndicator size="small" color="#D7FF00" />
                ) : (
                  <>
                    <Call width={22} height={22} />
                    <Text className="mt-0.5 text-[8px] font-medium text-[#F3F6E7]">
                      {canSpeak ? (isMuted ? "Unmute" : "Mute") : hasRaisedHand ? "Pending" : "Call in"}
                    </Text>
                  </>
                )}
              </Pressable>
              {canSpeak ? (
                <Pressable
                  onPress={handleHangUpSpeaker}
                  disabled={isCallActionLoading}
                  hitSlop={8}
                  className="h-9 min-w-[48px] items-center justify-center rounded-[12px] bg-[#F3523C]/20 px-2"
                >
                  <Text className="text-[8px] font-semibold text-[#FF8A7A]">
                    Hang up
                  </Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => { hapticMedium(); redirectToPaymentPage() }} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <MoneyIcon width={22} height={22} />
              </Pressable>
            </View>
          </View>
        </PodcastBottomDock>

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
                onPress={() => {
                  setIsExitPromptVisible(false);
                  if (profile?.id) {
                    leaveLivePodcastParticipant(id, profile.id).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["live-podcast-participants", id, hostId] })
                      queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
                    })
                  }
                  room?.localParticipant.setMicrophoneEnabled(false)
                  clearRoom()
                  router.replace("/(tabs)/podcast");
                }}
                className="flex-1 items-center justify-center bg-[#D7FF00] px-4 py-4"
              >
                <Text className="text-[18px] font-medium text-black">Leave</Text>
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
          isHost={false}
        />

        {/* <PodcastFullScreenModal
          visible={isPaymentMethodsVisible}
          onClose={() => {
            setIsCurrencySheetVisible(false);
            setIsPaymentMethodsVisible(false);
          }}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={() => {
                  setIsCurrencySheetVisible(false);
                  setIsPaymentMethodsVisible(false);
                }}
                hitSlop={12}
                className="self-start py-3 pr-3"
              >
                <ArrowLeft size={34} color="#F4F5F0" strokeWidth={2.2} />
              </Pressable>

              <Pressable
                onPress={() => setIsCurrencySheetVisible(true)}
                className="mt-4 w-[250px] rounded-[24px] bg-[#013220] px-4 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
                      <Text className="text-[11px] font-semibold text-[#013220]">
                        {selectedCurrency.flag}
                      </Text>
                    </View>
                    <Text className="ml-4 text-[18px] font-semibold text-[#F4F5F0]">
                      Currency
                    </Text>
                  </View>

                  <ChevronDown size={34} color="#D7FF00" strokeWidth={3} />
                </View>
              </Pressable>

              <Text className="mt-8 text-[18px] font-semibold text-[#F4F5F0]">
                Select payment method
              </Text>

              <View className="mt-4 gap-4">
                {podcastPaymentMethods.map((method) => (
                  <Pressable
                    key={method.id}
                    className="h-[80px] rounded-[24px] bg-[#013220] px-5 py-6"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="mr-4 flex-1 flex-row items-center">
                        <View className="h-[30px] w-[30px] items-center justify-center">
                          {renderPaymentMethodIcon(method.iconKey)}
                        </View>

                        <View className="ml-5 flex-1">
                          <Text className="text-[18px] font-medium text-[#F4F5F0]">
                            {method.title}
                          </Text>
                          {method.subtitle ? (
                            <Text className="mt-2 text-[14px] text-[#E4EAE3]">
                              {method.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {method.trailing === "chevron" ? (
                        <ChevronRight size={34} color="#D7FF00" strokeWidth={2.7} />
                      ) : (
                        <MaterialCommunityIcons
                          name="content-copy"
                          size={34}
                          color="#D7FF00"
                        />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </SafeAreaView>

          <PodcastBottomSheet
            visible={isCurrencySheetVisible}
            onClose={() => setIsCurrencySheetVisible(false)}
          >
            <View className="items-center">
              <View className="h-[4px] w-[82px] rounded-full bg-[#E8E8E8]" />
            </View>

            <View className="mt-8 gap-8">
              {podcastCurrencies.map((currency) => (
                <Pressable
                  key={currency.id}
                  onPress={() => {
                    setSelectedCurrencyId(currency.id);
                    setIsCurrencySheetVisible(false);
                  }}
                  className="flex-row items-center"
                >
                  <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
                    <Text className="text-[11px] font-semibold text-[#013220]">
                      {currency.flag}
                    </Text>
                  </View>
                  <Text className="ml-4 text-[16px] font-medium text-[#F4F5F0]">
                    {currency.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </PodcastBottomSheet>
        </PodcastFullScreenModal> */}

        <PodcastConnectingOverlay
          visible={shouldShowConnectingOverlay && isConnecting}
        />

        {speakerLimitMessage ? (
          <View className="absolute left-4 right-4 top-[122px] rounded-[18px] border border-[#D7FF00]/20 bg-[#0F2A08]/95 px-4 py-3">
            <Text className="text-center text-[13px] font-semibold text-[#F4F5F0]">
              {speakerLimitMessage}
            </Text>
          </View>
        ) : null}

        {hasRaisedHand && !canSpeak ? (
          <View className="absolute left-4 right-4 top-[122px] rounded-[18px] border border-[#D7FF00]/20 bg-[#0F2A08]/90 px-4 py-3">
            <View className="flex-row items-center">
              <HostAvatar
                hostName={profile?.full_name ?? "You"}
                hostPictureUrl={profile?.avatar_url}
                size={34}
                textClassName="text-sm font-bold text-menorah-primary"
              />
              <View className="ml-3 flex-1">
                <Text className="text-[13px] font-semibold text-[#F4F5F0]">
                  Call-in request sent
                </Text>
                <Text className="mt-1 text-[11px] text-[#B7C0BC]">
                  Waiting for the host to accept your request.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View pointerEvents="none" className="absolute bottom-24 right-6 h-[240px] w-[160px] overflow-visible">
          {visibleLoveBursts.map((love) => (
            <FloatingLove
              key={love.id}
              burstId={love.id}
              onDone={dismissVisibleLoveBurst}
            />
          ))}
        </View>
      </SafeAreaView>
    </PodcastBackground>
  );
};

// A warm, varied palette so a burst of hearts reads as a lively shower
// rather than identical icons stamped out one after another.
const LOVE_HEART_COLORS = ["#FF4B1F", "#FF6F91", "#FFA53D", "#FF3D68"]

const FloatingLove = ({
  burstId,
  onDone,
}: {
  burstId: string
  onDone: (burstId: string) => void
}) => {
  const progress = useRef(new Animated.Value(0)).current

  // Randomized once per burst (stable for this component's lifetime, since
  // burstId never changes) so each heart takes its own path, speed, size and
  // tilt - and, critically, so an in-flight heart's trajectory never shifts
  // just because an earlier heart finished and the list re-indexed.
  const flight = useMemo(() => ({
    originX: (Math.random() - 0.5) * 28,
    driftMid: (Math.random() - 0.5) * 100,
    driftEnd: (Math.random() - 0.5) * 70,
    rotate: (Math.random() - 0.5) * 34,
    size: 24 + Math.random() * 18,
    color: LOVE_HEART_COLORS[Math.floor(Math.random() * LOVE_HEART_COLORS.length)],
    duration: 1500 + Math.random() * 600,
    peakOpacity: 0.55 + Math.random() * 0.25,
    rise: 190 + Math.random() * 60,
  }), [])

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: flight.duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onDone(burstId))
  }, [burstId, onDone, progress, flight.duration])

  return (
    <Animated.View
      className="absolute bottom-0"
      style={{
        right: 16 + flight.originX,
        opacity: progress.interpolate({
          inputRange: [0, 0.15, 0.75, 1],
          outputRange: [0, flight.peakOpacity, flight.peakOpacity, 0],
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -flight.rise],
            }),
          },
          {
            translateX: progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, flight.driftMid, flight.driftEnd],
            }),
          },
          {
            rotate: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", `${flight.rotate}deg`],
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0.4, 1.15, 1],
            }),
          },
        ],
      }}
    >
      <MaterialCommunityIcons name="heart" size={flight.size} color={flight.color} />
    </Animated.View>
  )
}

export default MemberLivePodcast;
