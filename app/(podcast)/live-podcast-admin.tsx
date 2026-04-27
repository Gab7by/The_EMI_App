import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import LivePeople from "@/assets/svgs/live_people_icon.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useLivePodcastParticipants } from "@/hooks/tanstack-query-hooks";
import { endLiveSession } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Mic,
  Power,
  Share2,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";




const comments = [
  {
    id: "1",
    name: "Rev. Mrs. Millicent Kate Owusu",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "By Grace Hun. How about you My Love?",
  },
  {
    id: "2",
    name: "Kingdom Benedict",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yes please Agya. Please, how about you and the family",
  },
  {
    id: "3",
    name: "Uriel Merkabah Owusu-Kwarteng",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message:
      "Yes please Daddy. I am honored to be featured on this beautiful masterpiece. Thank You for having me.",
  },
  {
    id: "4",
    name: "Phanuel El-Eden Owusu-Adinkra$h",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yal Old Bowy. I love you so much! Thank you for having me. Woguan!",
  },
  {
    id: "5",
    name: "Rev. Mrs. Millicent Kate Owusu",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "By Grace Hun. How about you My Love?",
  },
  {
    id: "6",
    name: "Kingdom Benedict",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yes please Agya. Please, how about you and the family",
  },
  {
    id: "7",
    name: "Uriel Merkabah Owusu-Kwarteng",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message:
      "Yes please Daddy. I am honored to be featured on this beautiful masterpiece. Thank You for having me.",
  },
  {
    id: "8",
    name: "Phanuel El-Eden Owusu-Adinkra$h",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yal Old Bowy. I love you so much! Thank you for having me. Woguan!",
  }
];

const AdminLivePodcast = () => {

  const {id, title, playlist, hostId, hostName, hostPictureUrl} = useLocalSearchParams<{
            id: string,
            title: string,
            hostId: string,
            hostName: string,
            hostPictureUrl: string,
            playlist: string
  }>()

  const router = useRouter();
  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isOtherSettingsVisible, setIsOtherSettingsVisible] = useState(false);
  const [isBackgroundMusicVisible, setIsBackgroundMusicVisible] = useState(false);
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false);
  const [isMessageComposerVisible, setIsMessageComposerVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [sliderWidth, setSliderWidth] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0.7);
  const messageInputRef = useRef<TextInput | null>(null);
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false)

  const {data: participantCount} = useLivePodcastParticipants(hostId, id)

  const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

  const updateVolumeFromGesture = useCallback((locationX: number) => {
    if (!sliderWidth) return;
    setVolumeLevel(clampVolume(locationX / sliderWidth));
  }, [sliderWidth]);

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

  const openExitPrompt = () => {
    setIsExitPromptVisible(true);
  };

  const closeExitPrompt = () => {
    setIsExitPromptVisible(false);
  };

  const openOtherSettings = () => {
    setIsBackgroundMusicVisible(false);
    setIsVolumeControlVisible(false);
    setIsOtherSettingsVisible(true);
  };

  const closeOtherSettings = () => {
    setIsOtherSettingsVisible(false);
  };

  const openBackgroundMusic = () => {
    setIsOtherSettingsVisible(false);
    setIsVolumeControlVisible(false);
    setIsBackgroundMusicVisible(true);
  };

  const closeBackgroundMusic = () => {
    setIsBackgroundMusicVisible(false);
  };

  const openVolumeControl = () => {
    setIsOtherSettingsVisible(false);
    setIsBackgroundMusicVisible(false);
    setIsVolumeControlVisible(true);
  };

  const closeVolumeControl = () => {
    setIsVolumeControlVisible(false);
  };

  const openMessageComposer = () => {
    setIsOtherSettingsVisible(false);
    setIsBackgroundMusicVisible(false);
    setIsVolumeControlVisible(false);
    setIsMessageComposerVisible(true);
  };

  const closeMessageComposer = useCallback(() => {
    setIsMessageComposerVisible(false);
  }, []);

  useEffect(() => {
    if (!isMessageComposerVisible) return;

    const focusTimeout = setTimeout(() => {
      messageInputRef.current?.focus();
    }, 60);

    const keyboardHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsMessageComposerVisible(false);
    });

    return () => {
      clearTimeout(focusTimeout);
      keyboardHideSubscription.remove();
    };
  }, [isMessageComposerVisible]);

  const leaveLiveRoom = () => {
    setIsEndingSession(true)
    endLiveSession(id).then((success) => {
      if (success) {
        queryClient.invalidateQueries({queryKey: ["live-podcast-sessions"]})
        setIsEndingSession(false)
        closeExitPrompt()
        router.replace("/(tabs)/podcast")
      } else {
        setIsEndingSession(false)
      }
    }).catch(e => {
      console.error(e)
      setIsEndingSession(false)
    })
  }

  return (
    <LinearGradient
      colors={["#143703", "#4a7108", "#143703"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-4 pt-3">
          
            <View className="mb-10 flex-row items-center justify-between">
              <View className="mr-3 flex-1 flex-row items-center rounded-full bg-menorah-bg px-3 py-3">
                {
                  hostPictureUrl ?
                  <Image
                  source={{uri: hostPictureUrl}}
                  style={{ width: 42, height: 42, borderRadius: 21 }}
                  contentFit="cover"
                /> :
                (
                    <View style={{width: 42, height: 42, borderRadius: 21}} className="bg-menorah-bg items-center justify-center border border-menorah-primary">
                        <Text className="text-menorah-primary text-base font-bold">
                            {hostName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )
}
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-menorah-whiteSoft">
                    {playlist}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Text className="text-[10px] text-menorah-whiteSoft/70">
                      {hostName}
                    </Text>
                    <View className="ml-2">
                        <LivePeople  width={10} height={10} />
                    </View>
                    
                    <Text className=" ml-1 text-[9px] text-menorah-whiteSoft/60">
                      {participantCount}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="ml-7">
                  <HugeIcon width={30} height={30} />
                </View>
                <View>
                  <Share2 size={25} color="#F3F6E7" strokeWidth={1.2} />
                </View>
                <Pressable
                  onPress={openExitPrompt}
                  className="rounded-full bg-[#F3523C]/20 p-2"
                >
                  <Power size={23} color="#FF5A45" strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            <View className="mb-6 flex-row flex-wrap justify-between gap-y-4">
              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] rounded-full border border-white/40 bg-white/15">
                  {
                    hostPictureUrl ?
                    <Image
                    source={require("@/assets/pictures/host_profile_image.png")}
                    style={{ width: 60, height: 60, borderRadius: 30 }}
                    contentFit="cover"/> :
                    <View style={{width: 62, height: 62, borderRadius: 31}} className="bg-menorah-bg items-center justify-center border border-menorah-primary">
                        <Text className="text-menorah-primary text-2xl font-bold">
                            {hostName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                  }
                </View>
                <Text
                  className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85 overflow-ellipsis"
                  numberOfLines={1}
                >
                  {hostName}
                </Text>
              </View>

              
              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #1 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #2 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #3 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #4 Call In
                  </Text>
              </View>

           
              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #5 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #6 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #7 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #8 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                  <Image
                    source={require("@/assets/pictures/call_in_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                  <Text 
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #9 Call In
                  </Text>
              </View>

            </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: isMessageComposerVisible ? 170 : 110,
            }}
          >
            <View className="mb-7 rounded-[22px] bg-menorah-bg px-4 py-4">
              <Text className="text-[12px] leading-5 text-[#FFD700]">
                Please keep comments respectful and uplifting. &quot;Let your
                words edify and bring grace to those who hear.&quot; - Ephesians
                4:29.
              </Text>
            </View>

            <View className="gap-5">
              {comments.map((comment) => (
                <View key={comment.id} className="flex-row items-start">
                  <Image
                    source={comment.avatar}
                    style={{ width: 34, height: 34, borderRadius: 17 }}
                    contentFit="cover"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="mb-2 text-[11px] font-medium text-menorah-whiteSoft">
                      {comment.name}
                    </Text>
                    <View className="self-start rounded-2xl bg-white/20 px-4 py-3">
                      <Text className="max-w-[240px] text-[12px] font-semibold leading-4 text-menorah-whiteSoft/95">
                        {comment.message}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
          </View>

          <View className="absolute bottom-0 left-0 right-0 bg-[#143703] px-2 pb-3 pt-3">
            {isMessageComposerVisible ? (
              <View className="flex-row items-center">
                <View className="mr-5 flex-1 flex-row items-center rounded-[15px] h-[50px] border-[2px] border-[#ECE8E8] bg-[#143703] px-4 py-2">
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
                      closeMessageComposer();
                    }}
                  />
                </View>

                <Pressable hitSlop={10} className="mr-2" onPress={() => {}}>
                  <MaterialCommunityIcons
                    name="image-outline"
                    size={35}
                    color="#F5F2F2"
                  />
                </Pressable>

                <Pressable hitSlop={10} onPress={() => {}}>
                  <MaterialCommunityIcons
                    name="emoticon-happy-outline"
                    size={35}
                    color="#F5F2F2"
                  />
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-center justify-between px-4">
                <Pressable onPress={openOtherSettings} hitSlop={10}>
                  <TreeButton width={30} height={30} />
                </Pressable>
                <Pressable onPress={openBackgroundMusic} hitSlop={10}>
                  <MusicButton width={30} height={30} />
                </Pressable>
                <Pressable onPress={openMessageComposer} hitSlop={10}>
                  <MessagingButton width={30} height={30} />
                </Pressable>
                <Pressable onPress={openVolumeControl} hitSlop={10}>
                  <MicrophoneButton width={30} height={30} />
                </Pressable>
              </View>
            )}
          </View>

        {isOtherSettingsVisible ? (
          <Pressable
            onPress={closeOtherSettings}
            className="absolute inset-0 justify-end bg-black/30"
          >
            <Pressable
              onPress={() => {}}
              className="mx-0 mb-0 rounded-t-[22px] bg-menorah-bg px-6 pb-10 pt-3"
            >
              <View className="items-center">
                <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
              </View>

              <Pressable
                onPress={closeOtherSettings}
                className="mt-8 flex-row items-center justify-between"
              >
                <Text className="text-[16px] font-medium text-[#F2F5EE]">
                  Recording
                </Text>
                <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPress={closeOtherSettings}
                className="mt-10 flex-row items-center justify-between"
              >
                <Text className="text-[16px] font-medium text-[#F2F5EE]">
                  Themes
                </Text>
                <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
              </Pressable>
            </Pressable>
          </Pressable>
        ) : null}

        {isBackgroundMusicVisible ? (
          <Pressable
            onPress={closeBackgroundMusic}
            className="absolute inset-0 justify-end bg-black/30"
          >
            <Pressable
              onPress={() => {}}
              className="mx-0 mb-0 rounded-t-[22px] bg-menorah-bg px-6 pb-10 pt-3"
            >
              <View className="items-center">
                <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
              </View>

              <Pressable
                onPress={closeBackgroundMusic}
                className="mt-8 flex-row items-center justify-between"
              >
                <Text className="text-[16px] font-medium text-[#F2F5EE]">
                  Background Music
                </Text>
                <ChevronRight size={24} color="#D7FF00" strokeWidth={2.8} />
              </Pressable>
            </Pressable>
          </Pressable>
        ) : null}

        {isVolumeControlVisible ? (
          <Pressable
            onPress={closeVolumeControl}
            className="absolute inset-0 justify-end bg-black/30"
          >
            <Pressable
              onPress={() => {}}
              className="mx-0 mb-0 rounded-t-[22px] bg-menorah-bg px-6 pb-10 pt-3"
            >
              <View className="items-center">
                <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
              </View>

              <View className="mt-8  flex-row items-center justify-between">
                <Pressable onPress={closeVolumeControl} hitSlop={12}>
                  <ArrowLeft size={24} color="#D7FF00" strokeWidth={2.8} />
                </Pressable>
                <Text className="text-[18px] mb-0 font-bold text-[#D7FF00]">
                  Volume Control
                </Text>
                <View className="w-[42px]" />
              </View>

              <View className="mt-10 flex-row items-center">
                <Image
                  source={require("@/assets/pictures/host_profile_image.png")}
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                  contentFit="cover"
                />

                <View className="ml-2 w-[110px]">
                  <Text
                    className="text-[14px] text-[#D7FF00]"
                    numberOfLines={1}
                  >
                    Prophet S...
                  </Text>
                  <Text className="mt-1 text-[14px] text-[#B7C0BC]">
                    (Host)
                  </Text>
                </View>

                <View className="flex-1 flex-row items-center">
                  <View
                    className="flex-1 justify-center"
                    onLayout={(event) =>
                      setSliderWidth(event.nativeEvent.layout.width)
                    }
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
                    <Mic size={25} color="#D7FF00" strokeWidth={2.4} />
                  </View>
                </View>
              </View>
            </Pressable>
          </Pressable>
        ) : null}

        {isExitPromptVisible ? (
          <View className="absolute inset-0 items-center justify-center bg-black/40 px-5">
            <View className="w-full max-w-[360px] overflow-hidden rounded-[20px] bg-[#014C22]">
              <Pressable
                onPress={closeExitPrompt}
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
                >{
                    isEndingSession ?
                    (<View className="pointer-events-none animate-spin">
                        <Icon as={Loader2} color={Colors.menorah.bg} />
                    </View>) :
                  <Text className="text-[18px] font-medium text-black">
                    Leave
                  </Text> }
                </Pressable>
                <Pressable
                  onPress={closeExitPrompt}
                  className="flex-1 items-center justify-center bg-[#01411D] px-4 py-4"
                >
                  <Text className="text-[18px] font-medium text-[#D7FF00]">
                    Stay
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default AdminLivePodcast;
