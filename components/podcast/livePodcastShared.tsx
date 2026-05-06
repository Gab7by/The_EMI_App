import LivePeople from "@/assets/svgs/live_people_icon.svg";
import { LiveMessage } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
      <View className="ml-3 flex-1">
        <Text className="text-sm text-menorah-whiteSoft">{playlist}</Text>
        <View className="mt-1 flex-row items-center">
          <Text className="text-[10px] text-menorah-whiteSoft/70">{hostName}</Text>
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
  }[];
};

export const PodcastParticipantsGrid = ({
  participants,
}: PodcastParticipantsGridProps) => (
  <View className="mb-6 flex-row flex-wrap gap-y-4">
    {participants.map((participant) => (
      <View key={participant.id} className="mb-1 w-[20%] items-center">
        <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
          <HostAvatar
            hostName={participant.name}
            hostPictureUrl={participant.pictureUrl}
            size={60}
            textClassName="text-2xl font-bold text-menorah-primary"
          />
        </View>
        <Text
          className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
          numberOfLines={1}
        >
          {participant.name}
        </Text>
      </View>
    ))}
  </View>
);

type PodcastCommentsProps = {
  footerPadding: number;
  messages: LiveMessage[]
};

export const PodcastComments = ({ footerPadding, messages }: PodcastCommentsProps) => (
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
        <View className={`${item.isLocal ? "max-w-[82%] items-end" : "ml-3 flex-1"}`}>
          {!item.isLocal && (
            <Text className="mb-2 text-[11px] font-medium text-menorah-whiteSoft">
              {item.sender_name}
            </Text>
          )}
          <View
            className={`rounded-2xl px-4 py-3 ${
              item.isLocal ? "bg-[#D7FF00]" : "self-start bg-white/20"
            }`}
          >
            <Text className={`max-w-[240px] text-[12px] font-semibold leading-4 ${item.isLocal ? 'text-[#143703]' : 'text-menorah-whiteSoft'}`}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    )}
  />
);

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
    className="absolute left-0 right-0 bg-[#143703] px-4 pt-3"
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
    <View className="w-full max-w-[360px] overflow-hidden rounded-[24px] border border-[#D7FF00]/20 bg-[#0E2B08]">
      <View className="border-b border-[#D7FF00]/15 bg-[#143703] px-6 py-5">
        <Text className="text-[18px] font-semibold text-[#F4F5F0]">About live podcast</Text>
        <Text className="mt-1 text-[12px] text-[#B7C0BC]">
          Details from the current stream
        </Text>
      </View>

      <View className="px-6 py-5">
        <View className="rounded-[18px] bg-white/5 px-4 py-4">
          <Text className="text-[11px] uppercase tracking-[1px] text-[#D7FF00]">
            Podcast Playlist
          </Text>
          <Text className="mt-2 text-[17px] font-semibold text-[#F4F5F0]">
            {playlist}
          </Text>
        </View>

        <View className="mt-4 rounded-[18px] bg-white/5 px-4 py-4">
          <Text className="text-[11px] uppercase tracking-[1px] text-[#D7FF00]">
            Podcast Title
          </Text>
          <Text className="mt-2 text-[17px] font-semibold text-[#F4F5F0]">
            {title}
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          className="mt-6 items-center rounded-[18px] bg-[#D7FF00] px-4 py-4"
        >
          <Text className="text-[16px] font-semibold text-[#143703]">Close</Text>
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
