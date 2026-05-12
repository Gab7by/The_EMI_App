import LivePeople from "@/assets/svgs/live_people_icon.svg";
import { hapticMedium } from "@/lib/haptics";
import { LiveMessage, PodcastBackgroundProps } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type LayoutChangeEvent
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const podcastComments = [
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
  },
];

export type PodcastPaymentMethod = {
  id: "card" | "transfer" | "paypal" | "zelle" | "crypto";
  title: string;
  iconKey: "card" | "transfer" | "paypal" | "zelle" | "crypto";
  trailing: "chevron" | "copy";
  subtitle?: string;
};

export type PodcastCurrencyOption = {
  id: "ghs" | "usd" | "gbp" | "cad" | "zar";
  label: string;
  flag: string;
};

export const podcastPaymentMethods: PodcastPaymentMethod[] = [
  { id: "card", title: "Card", iconKey: "card", trailing: "chevron" },
  { id: "transfer", title: "Transfer", iconKey: "transfer", trailing: "chevron" },
  { id: "paypal", title: "Paypal", iconKey: "paypal", trailing: "copy" },
  { id: "zelle", title: "Zelle", iconKey: "zelle", trailing: "copy" },
  { id: "crypto", title: "Cryptocurrency", iconKey: "crypto", trailing: "chevron" },
];

export const podcastCurrencies: PodcastCurrencyOption[] = [
  { id: "ghs", label: "Ghana Cedi", flag: "GH" },
  { id: "usd", label: "United States Dollar", flag: "US" },
  { id: "gbp", label: "British Pound", flag: "GB" },
  { id: "cad", label: "Canadian Dollar", flag: "CA" },
  { id: "zar", label: "South African Rand", flag: "ZA" },
];

export const renderPaymentMethodIcon = (iconKey: PodcastPaymentMethod["iconKey"]) => {
  if (iconKey === "paypal") {
    return <Text className="text-[28px] font-bold italic text-[#D7FF00]">P</Text>;
  }

  const iconNameByKey = {
    card: "credit-card-outline",
    transfer: "bank-transfer-out",
    zelle: "alpha-z-circle-outline",
    crypto: "bitcoin",
  } as const;

  return (
    <MaterialCommunityIcons
      name={iconNameByKey[iconKey]}
      size={30}
      color="#D7FF00"
    />
  );
};

type HostAvatarProps = {
  hostName: string;
  hostPictureUrl?: string | null;
  size: number;
  textClassName: string;
};

export const HostAvatar = ({
  hostName,
  hostPictureUrl,
  size,
  textClassName,
}: HostAvatarProps) => {
  const initial = hostName?.charAt(0)?.toUpperCase() || "?";

  if (hostPictureUrl) {
    return (
      <Image
        source={{ uri: hostPictureUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center border border-menorah-primary bg-menorah-bg"
    >
      <Text className={textClassName}>{initial}</Text>
    </View>
  );
};

type PodcastHeaderProps = {
  playlist: string;
  hostName: string;
  hostPictureUrl?: string | null;
  participantCount?: number | null;
  actions: ReactNode;
};

export const PodcastHeader = ({
  playlist,
  hostName,
  hostPictureUrl,
  participantCount,
  actions,
}: PodcastHeaderProps) => (
  <View className="mb-10 flex-row items-center justify-between">
    <View className="mr-3 flex-1 flex-row items-center rounded-full bg-menorah-bg px-3 py-3">
      <HostAvatar
        hostName={hostName}
        hostPictureUrl={hostPictureUrl}
        size={42}
        textClassName="text-base font-bold text-menorah-primary"
      />
      <View className="ml-3 flex-1 min-w-0">
        <Text className="text-sm text-menorah-whiteSoft" numberOfLines={1} ellipsizeMode="tail">
          {playlist}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="text-[10px] text-menorah-whiteSoft/70 flex-1 min-w-0" numberOfLines={1} ellipsizeMode="tail">
            {hostName}
          </Text>
          <View className="ml-2">
            <LivePeople width={10} height={10} />
          </View>
          <Text className="ml-1 text-[9px] text-menorah-whiteSoft/60">
            {participantCount ?? 0}
          </Text>
        </View>
      </View>
    </View>
    <View className="flex-row items-center gap-3">{actions}</View>
  </View>
);

type PodcastParticipantsGridProps = {
  participants: {
    id: string;
    name: string;
    pictureUrl?: string | null;
    isSpeaking?: boolean;
    audioLevel?: number;
  }[];
};

export const PodcastParticipantsGrid = ({
  participants,
}: PodcastParticipantsGridProps) => {
  const isFewParticipants = participants.length <= 2;
  const avatarSize = isFewParticipants ? 80 : 62;
  const containerStyle = isFewParticipants
    ? "mb-6 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-4"
    : "mb-6 flex-row flex-wrap gap-y-4 gap-x-3";

  return (
    <View className={containerStyle}>
      {participants.map((participant) => {
        const isSpeaking = !!participant.isSpeaking;
        const glowOpacity = Math.min(0.75, 0.28 + (participant.audioLevel ?? 0) * 1.4);
        const glowScale = 1.08 + Math.min(0.12, (participant.audioLevel ?? 0) * 0.2);

        return (
          <View
            key={participant.id}
            className={isFewParticipants ? "mb-4 items-center" : "mb-1 w-[20%] items-center"}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ height: avatarSize + 10, width: avatarSize + 10 }}
            >
              {isSpeaking ? (
                <>
                  <View
                    pointerEvents="none"
                    className="absolute rounded-full bg-[#D7FF00]"
                    style={{
                      height: avatarSize + 10,
                      width: avatarSize + 10,
                      opacity: glowOpacity,
                      transform: [{ scale: glowScale }],
                    }}
                  />
                  <View
                    pointerEvents="none"
                    className="absolute rounded-full border-2 border-[#D7FF00]"
                    style={{
                      height: avatarSize + 8,
                      width: avatarSize + 8,
                      shadowColor: "#D7FF00",
                      shadowOpacity: 0.9,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 10,
                    }}
                  />
                </>
              ) : null}
              <View
                className={`items-center justify-center rounded-full border bg-[#C8D2BC] ${
                  isSpeaking ? "border-[#D7FF00]" : "border-white/40"
                }`}
                style={{ height: avatarSize, width: avatarSize }}
              >
                <HostAvatar
                  hostName={participant.name}
                  hostPictureUrl={participant.pictureUrl}
                  size={avatarSize - 4}
                  textClassName="text-2xl font-bold text-menorah-primary"
                />
              </View>
            </View>
            <Text
              className={`mt-1 text-center text-[10px] ${
                isSpeaking ? "font-semibold text-[#D7FF00]" : "text-menorah-whiteSoft/85"
              }`}
              numberOfLines={1}
            >
              {participant.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

type PodcastCommentsProps = {
  footerPadding: number;
  messages: LiveMessage[]
};

export const PodcastComments = ({ footerPadding, messages }: PodcastCommentsProps) => {
  const { width } = useWindowDimensions()
  const imageWidth = Math.min(width * 0.68, 220)
  const imageHeight = imageWidth * 0.72

  return (
    <FlashList
      data={messages}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
      <View className="mx-2 mt-8 items-center rounded-[24px] border border-white/10 bg-[#0F2A08]/80 px-6 py-8">
        <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#D7FF00]/15">
          <MaterialCommunityIcons
            name="message-text-outline"
            size={26}
            color="#D7FF00"
          />
        </View>
        <Text className="mt-4 text-[16px] font-semibold text-[#F4F5F0]">
          No messages yet
        </Text>
        <Text className="mt-2 text-center text-[12px] leading-5 text-[#B7C0BC]">
          Start the conversation with an encouraging message for everyone in the room.
        </Text>
      </View>
    )}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingBottom: footerPadding }}
    ListHeaderComponent={
      () => (
        <View className="mb-7 rounded-[22px] bg-menorah-bg px-4 py-4">
          <Text className="text-[12px] leading-5 text-[#FFD700]">
            Please keep comments respectful and uplifting. &quot;Let your words edify and
            bring grace to those who hear.&quot; - Ephesians 4:29.
          </Text>
        </View>  
      )
    }
    renderItem={({item}) => (
      <View
        className={`mb-5 flex-row ${item.isLocal ? "justify-end" : "items-start"}`}
      >
        {!item.isLocal && (
          item.sender_avartar_url ? (
            <Image
              source={{uri: item.sender_avartar_url}}
              style={{ width: 34, height: 34, borderRadius: 17 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{width: 34, height: 34, borderRadius: 17}}
              className="items-center justify-center bg-menorah-primary"
            >
              <Text className="text-lg font-bold text-menorah-bg">
                {item.sender_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )
        )}
        <View className={`${item.isLocal ? "items-end" : "ml-3"}`} style={{ maxWidth: width * 0.74, alignSelf: item.isLocal ? 'flex-end' : 'flex-start' }}>
          {!item.isLocal && (
            <Text className="mb-2 text-[11px] font-medium text-menorah-whiteSoft">
              {item.sender_name}
            </Text>
          )}
          {
            item.message_type === 'image' ? (
              <View style={{ width: imageWidth, height: imageHeight, borderRadius: 18, overflow: 'hidden', backgroundColor: '#152b1d' }}>
                <Image
                  source={{uri: item.content}}
                  style={{width: '100%', height: '100%'}}
                  contentFit="cover"
                />
              </View>
            ) : (
              <View
                className={`rounded-2xl px-4 py-3 ${
                  item.isLocal ? "bg-[#D7FF00]" : "self-start bg-white/20"
                }`}
                style={{ maxWidth: width * 0.68 }}
              >
                <Text className={`text-[12px] font-semibold leading-5 ${item.isLocal ? 'text-[#143703]' : 'text-menorah-whiteSoft'}`}>
                  {item.content}
                </Text>
              </View>
            )
          }
        </View>
      </View>
    )}
  />
)
};

export const usePodcastFooterLayout = () => {
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const footerBottom = keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom) : 0;
  const scrollPaddingBottom = footerHeight + footerBottom + 24;

  const handleFooterLayout = (event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  };

  return {
    footerBottom,
    footerPaddingBottom: insets.bottom > 0 ? insets.bottom : 16,
    scrollPaddingBottom,
    handleFooterLayout,
  };
};

type PodcastBottomDockProps = {
  bottom: number;
  paddingBottom: number;
  onLayout: (event: LayoutChangeEvent) => void;
  children: ReactNode;
};

export const PodcastBottomDock = ({
  bottom,
  paddingBottom,
  onLayout,
  children,
}: PodcastBottomDockProps) => (
  <View
    onLayout={onLayout}
    style={{ bottom }}
    className="absolute left-0 right-0 bg-[#143703] px-4 pt-2"
  >
    <View style={{ paddingBottom }}>{children}</View>
  </View>
);

type PodcastBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const PodcastBottomSheet = ({
  visible,
  onClose,
  children,
}: PodcastBottomSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View className="flex-1 justify-end">
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/35" />
      <View className="rounded-t-[24px] bg-menorah-bg px-6 pb-10 pt-3">{children}</View>
    </View>
  </Modal>
);

type PodcastDialogProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const PodcastDialog = ({
  visible,
  onClose,
  children,
}: PodcastDialogProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View className="flex-1 items-center justify-center px-5">
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />
      {children}
    </View>
  </Modal>
);

type PodcastNotesDialogProps = {
  visible: boolean;
  onClose: () => void;
  playlist: string;
  title: string;
};

export const PodcastNotesDialog = ({
  visible,
  onClose,
  playlist,
  title,
}: PodcastNotesDialogProps) => (
  <PodcastDialog visible={visible} onClose={onClose}>
    <View className="w-full max-w-[320px] overflow-hidden rounded-[20px] border border-[#D7FF00]/20 bg-[#0E2B08]">
      <View className="px-5 py-4">
        <View className="rounded-[16px] bg-white/5 px-3 py-3 mb-3">
          <Text className="text-[10px] uppercase tracking-[1px] text-[#D7FF00]">
            Playlist
          </Text>
          <Text className="mt-1 text-[15px] font-semibold text-[#F4F5F0]" numberOfLines={2}>
            {playlist}
          </Text>
        </View>

        <View className="rounded-[16px] bg-white/5 px-3 py-3">
          <Text className="text-[10px] uppercase tracking-[1px] text-[#D7FF00]">
            Title
          </Text>
          <Text className="mt-1 text-[15px] font-semibold text-[#F4F5F0]" numberOfLines={3}>
            {title}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            hapticMedium()
            onClose()
          }}
          className="mt-5 items-center rounded-[16px] bg-[#D7FF00] px-4 py-3"
        >
          <Text className="text-[14px] font-semibold text-[#143703]">Close</Text>
        </Pressable>
      </View>
    </View>
  </PodcastDialog>
);

type PodcastConnectingOverlayProps = {
  visible: boolean;
};

export const PodcastConnectingOverlay = ({
  visible,
}: PodcastConnectingOverlayProps) => (
  visible ? (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center bg-black/35 px-6"
    >
      <View className="w-full max-w-[280px] items-center rounded-[28px] border border-[#D7FF00]/20 bg-[#143703]/95 px-8 py-10">
        <View className="h-[74px] w-[74px] items-center justify-center rounded-full border border-[#D7FF00]/25 bg-[#0E2B08]">
          <ActivityIndicator size="large" color="#D7FF00" />
        </View>
        <Text className="mt-6 text-[20px] font-semibold text-[#F4F5F0]">
          Connecting...
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-[#B7C0BC]">
          Joining the live podcast room. Please hold on for a moment.
        </Text>
      </View>
    </View>
  ) : null
);

type PodcastFullScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const PodcastFullScreenModal = ({
  visible,
  onClose,
  children,
}: PodcastFullScreenModalProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View className="flex-1 bg-menorah-bg">{children}</View>
  </Modal>
);

export const PodcastBackground = ({
  coverUrl,
  children,
}: PodcastBackgroundProps) => (
  <View className="flex-1">
    <LinearGradient
          colors={["#143703", "#4a7108", "#143703"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      {
        coverUrl && (
          <Image
            source={{ uri: coverUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )
      }
      {coverUrl && (
        <View 
          style={[StyleSheet.absoluteFill, 
            { backgroundColor: "rgba(0, 0, 0, 0.45)" }]}
        />)}
      {children}
  </View>
);
