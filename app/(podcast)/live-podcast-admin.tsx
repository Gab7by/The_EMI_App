import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import {
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastConnectingOverlay,
  PodcastDialog,
  PodcastHeader,
  HostAvatar,
  PodcastNotesDialog,
  PodcastParticipantsGrid,
  usePodcastFooterLayout,
} from "@/components/podcast/livePodcastShared";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useActiveLivePodcastParticipants, useLivePodcastParticipants } from "@/hooks/tanstack-query-hooks";
import { useHostRooom } from "@/hooks/useHostRoom";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { approveSpeaker, sendSessionEnded } from "@/lib/livekit-signals";
import { endLiveSession, updateParticipantCalledIn } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useLiveKitStore } from "@/store/livekit-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Loader2, Mic, MicOff, Power, Share2, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminSheet = "none" | "settings" | "music" | "speakers";

const AdminLivePodcast = () => {
  const { id, title, playlist, hostId, hostName, hostPictureUrl, livekitRoomName } = useLocalSearchParams<{
    id: string;
    title: string;
    hostId: string;
    hostName: string;
    hostPictureUrl: string;
    playlist: string;
    livekitRoomName: string
  }>();

  const router = useRouter();
  const { data: participantCount } = useLivePodcastParticipants(hostId, id);
  const { data: activeParticipants = [] } = useActiveLivePodcastParticipants(id);
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

  const room = useLiveKitStore(state => state.room)
  const isMuted = useLiveKitStore(state => state.isMuted)
  const setIsMuted = useLiveKitStore(state => state.setIsMuted)
  const clearRoom = useLiveKitStore(state => state.clearRoom)
  const connectionState = useLiveKitStore(state => state.connectionState)

  const profile = useAuthStore(state => state.profile)

  const isConnecting = connectionState !== 'connected'

  useFocusEffect(
    useCallback(() => {
      setShouldShowConnectingOverlay(true);

      return () => {
        setShouldShowConnectingOverlay(false);
      };
    }, [])
  );
  
  useHostRooom(livekitRoomName)

  const {raisedHands, dismissRaisedHand} = useRoomSignals(room, profile?.id ?? "")
  const {messages, sendMessage} = useRoomChat(
    room,
    id,
    profile?.id ?? ''
  )
  const latestRaisedHand = raisedHands[raisedHands.length - 1]

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

        await new Promise(resolve => setTimeout(resolve, 500))
        }

        const success = await endLiveSession(id)
        if (!success) {
            setIsEndingSession(false)
            return
        }

        clearRoom()

        queryClient.invalidateQueries({ queryKey: ['live-podcast-sessions'] })

        setIsEndingSession(false)
        setIsExitPromptVisible(false)
        router.replace('/(tabs)/podcast')
    }

    finish().catch((error) => {
        console.error(error)
        setIsEndingSession(false)
    })
}

  const handleToggleMic = async () => {
    if (!room) return 

    const newMutedState = !isMuted

    await room.localParticipant.setMicrophoneEnabled(!newMutedState)

    setIsMuted(newMutedState)
  }

  const speakerParticipants = activeParticipants.filter((participant) => participant.is_called_in)

  const speakerRows = [
    {
      id: hostId,
      name: hostName,
      avatarUrl: hostPictureUrl ?? null,
      isMuted,
      isHost: true,
    },
    ...speakerParticipants.map((participant) => {
      const liveParticipant = room?.remoteParticipants.get(participant.profile_id)
      return {
        id: participant.profile_id,
        name: participant.profile?.full_name ?? "Speaker",
        avatarUrl: participant.profile?.avatar_url ?? null,
        isMuted: !(liveParticipant?.isMicrophoneEnabled ?? false),
        isHost: false,
      }
    })
  ]

  const speakerGridParticipants = speakerRows.map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    pictureUrl: speaker.avatarUrl,
  }))

  const handleApproveRaisedHand = async (participantId: string) => {
    if (!room || !profile) return

    await approveSpeaker(
      room,
      profile.id,
      profile.full_name ?? "Host",
      participantId
    )
    await updateParticipantCalledIn(id, participantId, true)
    dismissRaisedHand(participantId)
    queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
  }

  const handleRejectRaisedHand = (participantId: string) => {
    dismissRaisedHand(participantId)
  }

  const handleRemoveSpeaker = async (participantId: string) => {
    await updateParticipantCalledIn(id, participantId, false)
    queryClient.invalidateQueries({ queryKey: ["active-live-podcast-participants", id] })
  }

  return (
    <LinearGradient
      colors={["#143703", "#4a7108", "#143703"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
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
                <View className="ml-7">
                  <Pressable onPress={() => setIsNotesVisible(true)} hitSlop={10}>
                    <HugeIcon width={30} height={30} />
                  </Pressable>
                </View>
                <Share2 size={25} color="#F3F6E7" strokeWidth={1.2} />
                <Pressable
                  onPress={() => setIsExitPromptVisible(true)}
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
              <View className="mr-5 h-[50px] flex-1 flex-row items-center rounded-[15px] border-[2px] border-[#ECE8E8] bg-[#143703] px-2">
                <TextInput
                  ref={messageInputRef}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Input your message"
                  placeholderTextColor="#9D9D9D"
                  className="flex-1 text-[14px] text-white"
                  selectionColor="#FFFFFF"
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    handleSendMessage()
                    Keyboard.dismiss();
                    setIsMessageComposerVisible(false);
                  }}
                />
              </View>

              <Pressable hitSlop={10} className="mr-2">
                <MaterialCommunityIcons
                  name="image-outline"
                  size={35}
                  color="#F5F2F2"
                />
              </Pressable>

              <Pressable hitSlop={10}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={35}
                  color="#F5F2F2"
                />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-between px-4">
              <Pressable
                onPress={() => {
                  closeAllOverlays();
                  setActiveSheet("settings");
                }}
                hitSlop={10}
              >
                <TreeButton width={30} height={30} />
              </Pressable>
              <Pressable
                onPress={() => {
                  closeAllOverlays();
                  setActiveSheet("music");
                }}
                hitSlop={10}
              >
                <MusicButton width={30} height={30} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setActiveSheet("none");
                  setIsMessageComposerVisible(true);
                }}
                hitSlop={10}
              >
                <MessagingButton width={30} height={30} />
              </Pressable>
              <Pressable
                onPress={() => {
                  closeAllOverlays();
                  setActiveSheet("speakers");
                }}
                hitSlop={10}
              >
                <MicrophoneButton width={30} height={30} />
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
            onPress={() => setActiveSheet("none")}
            className="mt-8 flex-row items-center justify-between"
          >
            <Text className="text-[16px] font-medium text-[#F2F5EE]">Recording</Text>
            <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
          </Pressable>

          <Pressable
            onPress={() => setActiveSheet("none")}
            className="mt-10 flex-row items-center justify-between"
          >
            <Text className="text-[16px] font-medium text-[#F2F5EE]">Themes</Text>
            <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
          </Pressable>
        </PodcastBottomSheet>

        <PodcastBottomSheet
          visible={activeSheet === "music"}
          onClose={() => setActiveSheet("none")}
        >
          <View className="items-center">
            <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
          </View>

          <Pressable
            onPress={() => setActiveSheet("none")}
            className="mt-8 flex-row items-center justify-between"
          >
            <Text className="text-[16px] font-medium text-[#F2F5EE]">
              Background Music
            </Text>
            <ChevronRight size={24} color="#D7FF00" strokeWidth={2.8} />
          </Pressable>
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
            Raised Hands
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
                      className="flex-1 items-center rounded-[16px] bg-[#D7FF00] px-4 py-3"
                    >
                      <Text className="text-[14px] font-semibold text-[#143703]">Accept</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRejectRaisedHand(request.fromId)}
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
                onPress={leaveLiveRoom}
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
                onPress={() => setIsExitPromptVisible(false)}
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
    </LinearGradient>
  );
};

export default AdminLivePodcast;
