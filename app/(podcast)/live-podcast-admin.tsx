import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import {
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastDialog,
  PodcastHeader,
  PodcastNotesDialog,
  PodcastParticipantsGrid,
  usePodcastFooterLayout,
} from "@/components/podcast/livePodcastShared";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useLivePodcastParticipants } from "@/hooks/tanstack-query-hooks";
import { useHostRooom } from "@/hooks/useHostRoom";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { endLiveSession } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useLiveKitStore } from "@/store/livekit-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ConnectionState } from "livekit-client";
import { ArrowLeft, ChevronRight, Loader2, Mic, MicOff, Power, Share2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  PanResponder,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminSheet = "none" | "settings" | "music" | "volume";

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
  const { footerBottom, footerPaddingBottom, scrollPaddingBottom, handleFooterLayout } =
    usePodcastFooterLayout();

  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [activeSheet, setActiveSheet] = useState<AdminSheet>("none");
  const [isMessageComposerVisible, setIsMessageComposerVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [sliderWidth, setSliderWidth] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0.7);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const messageInputRef = useRef<TextInput | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const room = useLiveKitStore(state => state.room)
  const isMuted = useLiveKitStore(state => state.isMuted)
  const setIsMuted = useLiveKitStore(state => state.setIsMuted)
  const clearRoom = useLiveKitStore(state => state.clearRoom)
  const connectionState = useLiveKitStore(state => state.connectionState)

  const profile = useAuthStore(state => state.profile)

  const isConnecting = connectionState !== 'connected'
  
  useHostRooom(livekitRoomName)

  const {raisedHands} = useRoomSignals(room, profile?.id ?? "")

  const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

  const updateVolumeFromGesture = useCallback(
    (locationX: number) => {
      if (!sliderWidth) {
        return;
      }
      setVolumeLevel(clampVolume(locationX / sliderWidth));
    },
    [sliderWidth]
  );

  const sliderPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateVolumeFromGesture(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateVolumeFromGesture(event.nativeEvent.locationX);
        },
      }),
    [updateVolumeFromGesture]
  );

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
    setIsEndingSession(true);
    endLiveSession(id)
      .then((success) => {
        if (!success) {
          setIsEndingSession(false);
          return;
        }
        clearRoom()
        queryClient.invalidateQueries({ queryKey: ["live-podcast-sessions"] });
        setIsEndingSession(false);
        setIsExitPromptVisible(false);
        router.replace("/(tabs)/podcast");
      })
      .catch((error) => {
        console.error(error);
        setIsEndingSession(false);
      });
  };

  const handleToggleMic = async () => {
    if (!room) return 

    const newMutedState = !isMuted

    await room.localParticipant.setMicrophoneEnabled(!newMutedState)

    setIsMuted(newMutedState)
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
          {isConnecting && (
            <View className="items-center py-4">
              <Text className="text-menorah-primary text-sm">
                Connecting...
              </Text>
            </View>
          )}
          <PodcastParticipantsGrid
            hostName={hostName}
            hostPictureUrl={hostPictureUrl}
          />

          <PodcastComments footerPadding={scrollPaddingBottom} />
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
                  setActiveSheet("volume");
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
          visible={activeSheet === "volume"}
          onClose={() => setActiveSheet("none")}
        >
          <View className="items-center">
            <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
          </View>

          <View className="mt-8 flex-row items-center justify-between">
            <Pressable onPress={() => setActiveSheet("none")} hitSlop={12}>
              <ArrowLeft size={24} color="#D7FF00" strokeWidth={2.8} />
            </Pressable>
            <Text className="text-[18px] font-bold text-[#D7FF00]">Volume Control</Text>
            <View className="w-[42px]" />
          </View>

          <View className="mt-10 flex-row items-center">
            <Image
              source={
                hostPictureUrl
                  ? { uri: hostPictureUrl }
                  : require("@/assets/pictures/host_profile_image.png")
              }
              style={{ width: 50, height: 50, borderRadius: 10 }}
              contentFit="cover"
            />

            <View className="ml-2 w-[110px]">
              <Text className="text-[14px] text-[#D7FF00]" numberOfLines={1}>
                {hostName}
              </Text>
              <Text className="mt-1 text-[14px] text-[#B7C0BC]">(Host)</Text>
            </View>

            <View className="flex-1 flex-row items-center">
              <View
                className="flex-1 justify-center"
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                {...sliderPanResponder.panHandlers}
              >
                <View className="h-[16px] justify-center">
                  <View className="h-[10px] rounded-full bg-[#184832]" />
                  <View
                    className="absolute left-0 top-[3px] h-[10px] rounded-full bg-[#D7FF00]"
                    style={{ width: `${volumeLevel * 100}%` }}
                  />
                  <View
                    className="absolute top-1/2 h-[32px] w-[32px] -translate-x-[16px] -translate-y-[16px] rounded-full bg-[#D7FF00]"
                    style={{ left: `${volumeLevel * 100}%` }}
                  />
                </View>
              </View>

              <View className="ml-5">
                <Pressable
                  onPress={handleToggleMic}
                  className="w-16 h-16 rounded-full bg-menorah-darkGreen items-center justify-center"
                >
                  {isMuted
                    ? <MicOff size={24} color={Colors.menorah.primary} />
                    : <Mic size={24} color={Colors.menorah.primary} />
                  }
                </Pressable>
              </View>
            </View>
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
                  <Text className="text-[18px] font-medium text-black">Leave</Text>
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
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AdminLivePodcast;
