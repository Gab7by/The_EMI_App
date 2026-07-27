import LivePeople from "@/assets/svgs/live_people_icon.svg";
import { hapticMedium } from "@/lib/haptics";
import { LiveMessage, PodcastBackgroundProps } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    Image as RNImage,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent
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

export const MAX_GUEST_SPEAKERS = 10;
export const SPEAKER_LIMIT_MESSAGE = "Speaker slots are full. Please try again shortly.";

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

export const HostAvatar = memo(({
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
});
HostAvatar.displayName = "HostAvatar";

type PodcastHeaderProps = {
  playlist: string;
  hostName: string;
  hostPictureUrl?: string | null;
  participantCount?: number | null;
  onInfoPress?: () => void;
  actions: ReactNode;
};

export const PodcastHeader = ({
  playlist,
  hostName,
  hostPictureUrl,
  participantCount,
  onInfoPress,
  actions,
}: PodcastHeaderProps) => (
  <View className="mb-5 flex-row items-center justify-between">
    <Pressable
      onPress={onInfoPress}
      disabled={!onInfoPress}
      accessibilityRole={onInfoPress ? "button" : undefined}
      accessibilityLabel={onInfoPress ? "Show live participants" : undefined}
      className="mr-2 min-w-0 flex-1 flex-row items-center rounded-full border border-white/10 bg-menorah-bg/90 px-2.5 py-2.5"
    >
      <HostAvatar
        hostName={hostName}
        hostPictureUrl={hostPictureUrl}
        size={38}
        textClassName="text-sm font-bold text-menorah-primary"
      />
      <View className="ml-2.5 flex-1 min-w-0">
        <Text className="text-[13px] text-menorah-whiteSoft" numberOfLines={1} ellipsizeMode="tail">
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
    </Pressable>
    <View className="flex-row items-center gap-1.5">{actions}</View>
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

export const PodcastParticipantsGrid = memo(({
  participants,
}: PodcastParticipantsGridProps) => {
  const layout = useMemo(() => {
    const isFew = participants.length <= 2;

    return {
      isFewParticipants: isFew,
      avatarSize: isFew ? 80 : 56,
      containerStyle: isFew
        ? "mb-6 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-4"
        : "mb-5 flex-row flex-wrap gap-y-3",
    };
  }, [participants.length]);

  return (
    <View className={layout.containerStyle}>
      {participants.map((participant) => {
        const isSpeaking = !!participant.isSpeaking;
        const glowOpacity = Math.min(0.75, 0.28 + (participant.audioLevel ?? 0) * 1.4);
        const glowScale = 1.08 + Math.min(0.12, (participant.audioLevel ?? 0) * 0.2);

        return (
          <View
            key={participant.id}
            className={layout.isFewParticipants ? "mb-4 items-center" : "mb-1 items-center px-0.5"}
            style={layout.isFewParticipants ? undefined : { width: "20%" }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ height: layout.avatarSize + 10, width: layout.avatarSize + 10 }}
            >
              {isSpeaking ? (
                <>
                  <View
                    pointerEvents="none"
                    className="absolute rounded-full bg-[#D7FF00]"
                    style={{
                      height: layout.avatarSize + 10,
                      width: layout.avatarSize + 10,
                      opacity: glowOpacity,
                      transform: [{ scale: glowScale }],
                    }}
                  />
                  <View
                    pointerEvents="none"
                    className="absolute rounded-full border-2 border-[#D7FF00]"
                    style={{
                      height: layout.avatarSize + 8,
                      width: layout.avatarSize + 8,
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
                style={{ height: layout.avatarSize, width: layout.avatarSize }}
              >
                <HostAvatar
                  hostName={participant.name}
                  hostPictureUrl={participant.pictureUrl}
                  size={layout.avatarSize - 4}
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
});
PodcastParticipantsGrid.displayName = "PodcastParticipantsGrid";

type PodcastCommentsProps = {
  footerPadding: number;
  messages: LiveMessage[]
  currentUserId?: string
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  canDeleteMessage?: (senderId: string) => boolean
  canEditMessage?: (senderId: string) => boolean
  onReplyToMessage?: (messageId: string, senderName: string) => void
  replyingTo?: { messageId: string; senderName: string } | null
  onCancelReply?: () => void
};

type ImageViewerProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onDownload: () => void;
};

export const ImageViewer = memo(({ visible, imageUri, onClose, onDownload }: ImageViewerProps) => {
  const insets = useSafeAreaInsets();

  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        <Pressable
          onPress={onClose}
          className="absolute right-4 z-10 h-12 w-12 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={28}
            color="white"
          />
        </Pressable>

        <Pressable
          onPress={onDownload}
          className="absolute left-4 z-10 h-12 w-12 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8 }}
        >
          <MaterialCommunityIcons
            name="download"
            size={28}
            color="#D7FF00"
          />
        </Pressable>

        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      </View>
    </Modal>
  );
});
ImageViewer.displayName = "ImageViewer";

type ProfileViewerProps = {
  visible: boolean;
  imageUrl: string | null;
  userName: string;
  onClose: () => void;
};

export const ProfileViewer = memo(({ visible, imageUrl, userName, onClose }: ProfileViewerProps) => {
  const insets = useSafeAreaInsets();

  if (!visible || !imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        <Pressable
          onPress={onClose}
          className="absolute right-4 z-10 h-12 w-12 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={28}
            color="white"
          />
        </Pressable>

        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />

        <View
          className="absolute bottom-0 left-0 right-0 items-center justify-center rounded-t-[24px] bg-black/60 px-6 py-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        >
          <Text className="text-[15px] font-semibold text-white">
            {userName}
          </Text>
        </View>
      </View>
    </Modal>
  );
});
ProfileViewer.displayName = "ProfileViewer";

const getBoundedImageSize = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.round(sourceWidth * ratio),
    height: Math.round(sourceHeight * ratio),
  };
};

const ChatImage = memo(({ uri, maxWidth, onPress }: { uri: string; maxWidth: number; onPress?: (uri: string) => void }) => {
  const maxHeight = Math.min(maxWidth * 1.45, 360);
  const [imageSize, setImageSize] = useState(() => ({
    width: maxWidth,
    height: Math.min(maxWidth, maxHeight),
  }));
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    RNImage.getSize(
      uri,
      (sourceWidth, sourceHeight) => {
        if (!isMounted || sourceWidth <= 0 || sourceHeight <= 0) return;
        setImageSize(getBoundedImageSize(sourceWidth, sourceHeight, maxWidth, maxHeight));
      },
      () => {
        if (!isMounted) return;
        setImageSize({
          width: maxWidth,
          height: Math.min(maxWidth, maxHeight),
        });
      }
    );

    return () => {
      isMounted = false;
    };
  }, [maxHeight, maxWidth, uri]);

  return (
    <Pressable
      onPress={() => onPress?.(uri)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        {
          width: imageSize.width,
          height: imageSize.height,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: '#152b1d',
        },
        isPressed && { opacity: 0.7 }
      ]}
    >
      <Image
        source={{uri}}
        style={{width: '100%', height: '100%'}}
        contentFit="cover"
      />
    </Pressable>
  );
});
ChatImage.displayName = "ChatImage";

// ─── Reply Preview Banner ───────────────────────────────────────────────
const ReplyPreviewBanner = memo(({
  replyPreview,
  onTap,
}: {
  replyPreview: { sender_name: string; content: string; message_type: string }
  onTap?: () => void
}) => {
  const displayText = replyPreview.message_type === 'image'
    ? '📷 Image'
    : replyPreview.content.length > 60
      ? replyPreview.content.slice(0, 60) + '...'
      : replyPreview.content

  return (
    <Pressable
      onPress={onTap}
      className="mb-1.5 flex-row items-center overflow-hidden rounded-lg border-l-[3px] border-[#D7FF00] bg-white/5 px-2.5 py-1.5"
    >
      <View className="flex-1">
        <Text className="text-[10px] font-semibold text-[#D7FF00]" numberOfLines={1}>
          {replyPreview.sender_name}
        </Text>
        <Text className="mt-0.5 text-[9px] text-white/60" numberOfLines={1}>
          {displayText}
        </Text>
      </View>
      <MaterialCommunityIcons name="reply" size={12} color="#D7FF00" style={{ opacity: 0.6 }} />
    </Pressable>
  )
})
ReplyPreviewBanner.displayName = "ReplyPreviewBanner"

// ─── Edit Message Input ─────────────────────────────────────────────────
const EditMessageInput = memo(({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string
  onSave: (newContent: string) => void
  onCancel: () => void
}) => {
  const [editText, setEditText] = useState(initialContent)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <View className="rounded-2xl bg-white/10 px-3.5 py-2.5">
      <TextInput
        ref={inputRef}
        value={editText}
        onChangeText={setEditText}
        className="text-[11px] font-semibold leading-4 text-menorah-whiteSoft"
        multiline
        selectionColor="#D7FF00"
        returnKeyType="default"
      />
      <View className="mt-2 flex-row justify-end gap-2">
        <Pressable
          onPress={onCancel}
          className="rounded-lg bg-white/10 px-3 py-1.5"
        >
          <Text className="text-[10px] font-semibold text-white/60">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => onSave(editText)}
          disabled={!editText.trim()}
          className="rounded-lg bg-[#D7FF00] px-3 py-1.5"
        >
          <Text className={`text-[10px] font-semibold ${editText.trim() ? 'text-[#143703]' : 'text-[#143703]/40'}`}>
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  )
})
EditMessageInput.displayName = "EditMessageInput"

// ─── Main PodcastComments Component ─────────────────────────────────────
export const PodcastComments = memo(({
  footerPadding,
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  canDeleteMessage,
  canEditMessage,
  onReplyToMessage,
  replyingTo,
  onCancelReply,
}: PodcastCommentsProps) => {
  const { width } = useWindowDimensions()
  const listRef = useRef<FlashListRef<LiveMessage>>(null)
  const shouldScrollToLatestRef = useRef(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [canScroll, setCanScroll] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null)
  const [profileViewerVisible, setProfileViewerVisible] = useState(false)
  const [profileViewerImageUrl, setProfileViewerImageUrl] = useState<string | null>(null)
  const [profileViewerName, setProfileViewerName] = useState('')
  const imageWidth = Math.min(width * 0.72, 280)
  const latestMessageId = messages[messages.length - 1]?.id
  const scrollButtonIcon = isAtBottom ? "chevron-up" : "chevron-down"
  const scrollButtonLabel = isAtBottom ? "Go to first message" : "Go to latest message"

  // Build a map of messageId to index for scroll-to-reply
  const messageIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    messages.forEach((msg, index) => {
      map.set(msg.id, index)
    })
    return map
  }, [messages])

  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated })
    })
  }, [])

  const scrollToFirstMessage = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [])

  const scrollToMessage = useCallback((messageId: string) => {
    const index = messageIndexMap.get(messageId)
    if (index !== undefined) {
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
      } catch {
        // Fallback: content may not be rendered yet
      }
    }
  }, [messageIndexMap])

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height)
    const nextIsAtBottom = distanceFromBottom <= 64
    const nextCanScroll = contentSize.height > layoutMeasurement.height + 64

    setIsAtBottom(nextIsAtBottom)
    setCanScroll(nextCanScroll)
  }, [])

  const handleScrollButtonPress = useCallback(() => {
    hapticMedium()

    if (isAtBottom) {
      scrollToFirstMessage()
      return
    }

    scrollToLatestMessage()
  }, [isAtBottom, scrollToFirstMessage, scrollToLatestMessage])

  const handleContentSizeChange = useCallback(() => {
    if (!messages.length) return

    if (shouldScrollToLatestRef.current || isAtBottom) {
      scrollToLatestMessage(false)
      shouldScrollToLatestRef.current = false
    }
  }, [isAtBottom, messages.length, scrollToLatestMessage])

  useEffect(() => {
    if (!messages.length) {
      shouldScrollToLatestRef.current = true
      setIsAtBottom(true)
      setCanScroll(false)
      return
    }

    if (shouldScrollToLatestRef.current || isAtBottom) {
      scrollToLatestMessage(!shouldScrollToLatestRef.current)
      shouldScrollToLatestRef.current = false
    }
  }, [isAtBottom, latestMessageId, messages.length, scrollToLatestMessage])

  // Dismiss selections when keyboard hides
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setSelectedMessageId(null)
      setEditingMessageId(null)
      setDeleteConfirmMessageId(null)
    })

    return () => hideSubscription.remove()
  }, [])

  const handleMessagePress = useCallback((messageId: string) => {
    Keyboard.dismiss()
    setSelectedMessageId(prev => prev === messageId ? null : messageId)
  }, [])

  const handleEditStart = useCallback((messageId: string) => {
    setEditingMessageId(messageId)
    setSelectedMessageId(null)
  }, [])

  const handleEditSave = useCallback((messageId: string, newContent: string) => {
    onEditMessage?.(messageId, newContent)
    setEditingMessageId(null)
  }, [onEditMessage])

  const handleEditCancel = useCallback(() => {
    setEditingMessageId(null)
  }, [])

  const handleDeleteRequest = useCallback((messageId: string) => {
    setDeleteConfirmMessageId(messageId)
    setSelectedMessageId(null)
  }, [])

  const handleDeleteConfirm = useCallback((messageId: string) => {
    onDeleteMessage?.(messageId)
    setDeleteConfirmMessageId(null)
  }, [onDeleteMessage])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmMessageId(null)
  }, [])

  const handleReplyTap = useCallback((messageId: string, senderName: string) => {
    onReplyToMessage?.(messageId, senderName)
    setSelectedMessageId(null)
  }, [onReplyToMessage])

  const handleImagePress = useCallback((uri: string) => {
    setSelectedImageUri(uri)
    setIsImageViewerVisible(true)
  }, [])

  const handleCloseImageViewer = useCallback(() => {
    setIsImageViewerVisible(false)
    setSelectedImageUri(null)
  }, [])

  const handleDownloadImage = useCallback(async () => {
    if (!selectedImageUri) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to save images to your device.');
        return;
      }

      Alert.alert('Downloading', 'Saving image to your device...');

      const fileExtension = selectedImageUri.split('.').pop() || 'jpg';
      const fileName = `EMI_Image_${Date.now()}.${fileExtension}`;
      
      const destinationDir = new Directory(Paths.document, 'downloads');
      
      if (!destinationDir.exists) {
        destinationDir.create();
      }

      const downloadedFile = await File.downloadFileAsync(
        selectedImageUri,
        destinationDir
      );

      await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);
      Alert.alert('Success', 'Image saved to your device gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download image. Please try again.');
      console.error('Download error:', error);
    }
  }, [selectedImageUri])

  const listHeader = useMemo(() => (
    <View className="mb-5 rounded-2xl bg-menorah-bg/90 px-3.5 py-3">
      <Text className="text-[11px] leading-4 text-[#FFD700]">
        Please keep comments respectful and uplifting. "Let your words edify and
        bring grace to those who hear." - Ephesians 4:29.
      </Text>
    </View>  
  ), [])
  const listEmpty = useMemo(() => (
    <View className="mx-2 mt-8 items-center rounded-[24px] border border-white/10 bg-[#0F2A08]/80 px-6 py-8">
      <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#D7FF00]/15">
        <MaterialCommunityIcons
          name="message-text-outline"
          size={26}
          color="#D7FF00"
        />
      </View>
      <Text className="mt-4 text-[15px] font-semibold text-[#F4F5F0]">
        No messages yet
      </Text>
      <Text className="mt-2 text-center text-[12px] leading-5 text-[#B7C0BC]">
        Start the conversation with an encouraging message for everyone in the room.
      </Text>
    </View>
  ), [])

  const renderMessage = useCallback(({item}: { item: LiveMessage }) => {
    // System messages (join/leave notifications)
    if (item.message_type === 'system') {
      return (
        <View className="mb-3 items-center">
          <View className="rounded-full bg-white/5 px-4 py-1.5">
            <Text className="text-[10px] text-white/40 italic">
              {item.content}
            </Text>
          </View>
        </View>
      )
    }

    const isOwn = item.isLocal ?? false
    const isSelected = selectedMessageId === item.id
    const isEditing = editingMessageId === item.id
    const showDeleteConfirm = deleteConfirmMessageId === item.id
    const userCanDelete = canDeleteMessage?.(item.sender_id) ?? false
    const userCanEdit = canEditMessage?.(item.sender_id) ?? false
    const hasReply = item.reply_to_id && item.reply_preview

    return (
      <Pressable
        onPress={() => handleMessagePress(item.id)}
        className={`mb-3.5 ${isOwn ? "items-end" : "items-start"}`}
      >
        <View
          className={`flex-row ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <Pressable
            onPress={() => {
              if (item.sender_avartar_url) {
                setProfileViewerImageUrl(item.sender_avartar_url)
                setProfileViewerName(item.sender_name)
                setProfileViewerVisible(true)
              }
            }}
            disabled={!item.sender_avartar_url}
          >
            {item.sender_avartar_url ? (
              <Image
                source={{uri: item.sender_avartar_url}}
                style={{ width: 30, height: 30, borderRadius: 15 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{width: 30, height: 30, borderRadius: 15}}
                className="items-center justify-center bg-menorah-primary"
              >
                <Text className="text-base font-bold text-menorah-bg">
                  {item.sender_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>
          <View
            className={`${isOwn ? "items-end mr-3" : "items-start ml-3"}`}
            style={{ maxWidth: width * 0.74 }}
          >
            <Text className="mb-1.5 text-[10px] font-medium text-menorah-whiteSoft/90">
              {item.sender_name}
            </Text>

            {/* Reply Preview Banner */}
            {hasReply && item.reply_preview && (
              <ReplyPreviewBanner
                replyPreview={item.reply_preview}
                onTap={() => scrollToMessage(item.reply_to_id!)}
              />
            )}

            {/* Message Bubble / Edit Input */}
            {isEditing ? (
              <EditMessageInput
                initialContent={item.content}
                onSave={(newContent) => handleEditSave(item.id, newContent)}
                onCancel={handleEditCancel}
              />
            ) : (
              <>
                {item.message_type === 'image' ? (
                  <ChatImage uri={item.content} maxWidth={imageWidth} onPress={handleImagePress} />
                ) : (
                  <View
                    className={`rounded-2xl px-3.5 py-2.5 ${
                      isOwn ? "bg-[#D7FF00]" : "self-start bg-white/20"
                    } ${isSelected ? 'border border-[#D7FF00]' : ''}`}
                    style={{ maxWidth: width * 0.68 }}
                  >
                    <Text className={`text-[11px] font-semibold leading-4 ${isOwn ? 'text-[#143703]' : 'text-menorah-whiteSoft'}`}>
                      {item.content}
                    </Text>
                    {item.edited_at && (
                      <Text className={`text-[8px] mt-0.5 ${isOwn ? 'text-[#143703]/60' : 'text-white/40'}`}>
                        (edited)
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <View className="mt-1.5 flex-row items-center gap-2 rounded-lg bg-[#F3523C]/20 px-2.5 py-1.5">
                <Text className="text-[10px] text-white/70">Delete?</Text>
                <Pressable
                  onPress={() => handleDeleteConfirm(item.id)}
                  className="rounded bg-[#F3523C] px-2 py-0.5"
                >
                  <Text className="text-[9px] font-semibold text-white">Yes</Text>
                </Pressable>
                <Pressable
                  onPress={handleDeleteCancel}
                  className="rounded bg-white/10 px-2 py-0.5"
                >
                  <Text className="text-[9px] font-semibold text-white/60">No</Text>
                </Pressable>
              </View>
            )}

            {/* Action Buttons (shown when message is selected) */}
            {isSelected && !isEditing && !showDeleteConfirm && (
              <View className="mt-1.5 flex-row items-center gap-2">
                <Pressable
                  onPress={() => handleReplyTap(item.id, item.sender_name)}
                  className="flex-row items-center gap-1 rounded-full bg-[#D7FF00]/20 px-2.5 py-1"
                >
                  <MaterialCommunityIcons name="reply" size={12} color="#D7FF00" />
                  <Text className="text-[9px] font-semibold text-[#D7FF00]">Reply</Text>
                </Pressable>
                {userCanEdit && (
                  <Pressable
                    onPress={() => handleEditStart(item.id)}
                    className="flex-row items-center gap-1 rounded-full bg-[#87CEEB]/20 px-2.5 py-1"
                  >
                    <MaterialCommunityIcons name="pencil" size={12} color="#87CEEB" />
                    <Text className="text-[9px] font-semibold text-[#87CEEB]">Edit</Text>
                  </Pressable>
                )}
                {userCanDelete && (
                  <Pressable
                    onPress={() => handleDeleteRequest(item.id)}
                    className="flex-row items-center gap-1 rounded-full bg-[#FF6B6B]/20 px-2.5 py-1"
                  >
                    <MaterialCommunityIcons name="delete-outline" size={12} color="#FF6B6B" />
                    <Text className="text-[9px] font-semibold text-[#FF6B6B]">Delete</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    )
  }, [
    imageWidth,
    width,
    selectedMessageId,
    editingMessageId,
    deleteConfirmMessageId,
    canDeleteMessage,
    canEditMessage,
    handleMessagePress,
    handleEditSave,
    handleEditCancel,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleReplyTap,
    scrollToMessage,
    handleImagePress,
  ])

  return (
    <View className="relative min-h-[220px] flex-1">
      {/* Tap backdrop to deselect message */}
      {selectedMessageId && (
        <Pressable
          onPress={() => setSelectedMessageId(null)}
          className="absolute inset-0 z-0"
        />
      )}
      <FlashList
        ref={listRef}
        data={messages}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={listEmpty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: footerPadding }}
        ListHeaderComponent={listHeader}
        onContentSizeChange={handleContentSizeChange}
        onLoad={() => scrollToLatestMessage(false)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={renderMessage}
        extraData={{ selectedMessageId, editingMessageId, deleteConfirmMessageId }}
      />
      {messages.length > 0 && canScroll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={scrollButtonLabel}
          onPress={handleScrollButtonPress}
          className="absolute right-1 h-11 w-11 items-center justify-center rounded-full border border-[#D7FF00]/30 bg-[#143703]/95"
          style={{ bottom: Math.max(footerPadding - 28, 8) }}
        >
          <MaterialCommunityIcons
            name={scrollButtonIcon}
            size={26}
            color="#D7FF00"
          />
        </Pressable>
      ) : null}

      {/* Replying to indicator at bottom */}
      {replyingTo && (
        <View className="absolute bottom-0 left-0 right-0 flex-row items-center bg-[#143703] px-4 py-2">
          <View className="flex-1 flex-row items-center">
            <MaterialCommunityIcons name="reply" size={16} color="#D7FF00" />
            <Text className="ml-2 text-[11px] text-white/70">
              Replying to <Text className="font-semibold text-[#D7FF00]">{replyingTo.senderName}</Text>
            </Text>
          </View>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#FF6B6B" />
          </Pressable>
        </View>
      )}

      <ImageViewer
        visible={isImageViewerVisible}
        imageUri={selectedImageUri}
        onClose={handleCloseImageViewer}
        onDownload={handleDownloadImage}
      />

      <ProfileViewer
        visible={profileViewerVisible}
        imageUrl={profileViewerImageUrl}
        userName={profileViewerName}
        onClose={() => {
          setProfileViewerVisible(false)
          setProfileViewerImageUrl(null)
          setProfileViewerName('')
        }}
      />
    </View>
  );
});
PodcastComments.displayName = "PodcastComments";

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

  const footerBottom = useMemo(
    () => keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom) : 0,
    [insets.bottom, keyboardHeight]
  );
  const scrollPaddingBottom = useMemo(
    () => footerHeight + footerBottom + 24,
    [footerBottom, footerHeight]
  );

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  }, []);

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
}: PodcastBottomSheetProps) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/35" />
        <View
          className="rounded-t-[24px] bg-menorah-bg px-6 pt-3"
          style={{
            maxHeight: height * 0.82,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  )
};

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
          colors={["#0B1F0E", "#31560A", "#0B1F0E"]}
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
            { backgroundColor: "rgba(0, 0, 0, 0.42)" }]}
        />)}
      {children}
  </View>
);