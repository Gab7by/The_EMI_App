import LivePeople from "@/assets/svgs/live_people_icon.svg";
import { hapticHeavy, hapticLight, hapticMedium } from "@/lib/haptics";
import { ChatActionResult, LiveMessage, PodcastBackgroundProps } from "@/types/podcast-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Directory, File, Paths } from 'expo-file-system';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from 'expo-media-library';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

// ─────────────────────────────────────────────────────────────────────
// Dummy data (kept for backward compatibility with the existing export)
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// Types exposed to the screen
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// HostAvatar
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastHeader
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastParticipantsGrid
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastComments – types & component
// ─────────────────────────────────────────────────────────────────────
type PodcastCommentsProps = {
  footerPadding: number;
  messages: LiveMessage[]
  isLoading?: boolean
  currentUserId?: string
  onEditMessage?: (message: LiveMessage, newContent: string) => Promise<ChatActionResult>
  onDeleteMessage?: (message: LiveMessage) => Promise<ChatActionResult>
  canDeleteMessage?: (message: LiveMessage) => boolean
  canEditMessage?: (message: LiveMessage) => boolean
  onReplyToMessage?: (messageId: string, senderName: string) => void
  replyingTo?: { messageId: string; senderName: string } | null
  onCancelReply?: () => void
};

// ─────────────────────────────────────────────────────────────────────
// ImageViewer
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// ProfileViewer
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// ChatImage — inline image with size constraint
// ─────────────────────────────────────────────────────────────────────
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
  const [imageSize, setImageSize] = useState({ width: maxWidth, height: Math.min(maxWidth, maxHeight) });
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
        setImageSize({ width: maxWidth, height: Math.min(maxWidth, maxHeight) });
      }
    );
    return () => { isMounted = false; };
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

// ─────────────────────────────────────────────────────────────────────
// ReplyPreviewBanner — WhatsApp-style minimal reply indicator.
// Shown inside a message bubble when it's a reply to another message:
// a small colored left bar + sender name + truncated content preview.
// Tapping it scrolls to the original message.
// ─────────────────────────────────────────────────────────────────────
const ReplyPreviewBanner = memo(({
  replyPreview,
  onTap,
  isOwn,
}: {
  replyPreview: { sender_name: string; content: string; message_type: string }
  onTap?: () => void
  isOwn?: boolean
}) => {
  // The chip always sits on an opaque dark surface, so it remains legible on
  // lime own-message bubbles and arbitrary podcast cover images alike.
  const accentColor = isOwn ? "#FFFFFF" : "#D7FF00"
  return (
    <Pressable
      onPress={onTap}
      hitSlop={6}
      className="mb-1 flex-row items-center self-start rounded-full border border-white/20 bg-[#08130A]/85 px-2 py-1"
    >
      <MaterialCommunityIcons name="reply" size={13} color={accentColor} />
      <Text className="ml-1 text-[10px] font-bold" style={{ color: accentColor }} numberOfLines={1}>
        Replying to {replyPreview.sender_name}
      </Text>
    </Pressable>
  )
})
ReplyPreviewBanner.displayName = "ReplyPreviewBanner"

// ─────────────────────────────────────────────────────────────────────
// EditMessageInput — inline editor with Save/Cancel
// ─────────────────────────────────────────────────────────────────────
const EditMessageInput = memo(({
  initialContent,
  onSave,
  onCancel,
  isLoading,
}: {
  initialContent: string
  onSave: (newContent: string) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [editText, setEditText] = useState(initialContent)
  const inputRef = useRef<TextInput>(null)
  const canSave = editText.trim().length > 0 && editText !== initialContent && !isLoading

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <View className="rounded-2xl bg-white/10 px-3.5 py-2.5">
      <TextInput
        ref={inputRef}
        value={editText}
        onChangeText={setEditText}
        className="text-[13px] font-semibold leading-5 text-menorah-whiteSoft min-h-[44px]"
        multiline
        selectionColor="#D7FF00"
        returnKeyType="default"
        editable={!isLoading}
      />
      <View className="mt-2 flex-row justify-end gap-2">
        <Pressable
          onPress={(event) => { event.stopPropagation(); onCancel() }}
          disabled={isLoading}
          className="rounded-lg bg-white/10 px-4 py-2"
        >
          <Text className="text-[12px] font-semibold text-white/60">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={(event) => { event.stopPropagation(); onSave(editText) }}
          disabled={!canSave}
          className="rounded-lg bg-[#D7FF00] px-4 py-2 flex-row items-center gap-1.5"
        >
          {isLoading && (
            <ActivityIndicator size="small" color="#143703" />
          )}
          <Text className={`text-[12px] font-semibold ${canSave ? 'text-[#143703]' : 'text-[#143703]/40'}`}>
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  )
})
EditMessageInput.displayName = "EditMessageInput"

// ─────────────────────────────────────────────────────────────────────
// Snackbar — animated toast for success/error/info feedback
// ─────────────────────────────────────────────────────────────────────
type SnackbarState = {
  message: string
  type: 'success' | 'error' | 'info'
} | null

const Snackbar = memo(({ state, onDismiss }: { state: SnackbarState; onDismiss: () => void }) => {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!state) {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start()
      return
    }
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss())
  }, [state, opacity, onDismiss])

  if (!state) return null

  const bgColor = state.type === 'error' ? '#F3523C' : state.type === 'success' ? '#143703' : '#0F2A08'
  const borderColor = state.type === 'error' ? '#FF8A7A' : '#D7FF00'

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 z-50 mx-4 mb-2 rounded-xl border px-4 py-3"
      style={{
        opacity: opacity,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1,
        marginBottom: 8,
      }}
    >
      <Text className="text-[12px] font-semibold text-white text-center">
        {state.message}
      </Text>
    </Animated.View>
  )
})
Snackbar.displayName = "Snackbar"

// ─────────────────────────────────────────────────────────────────────
// MessageActionMenu — anchored directly under the selected message bubble
// (iMessage / Telegram style). No bottom-modal noise: the actions belong
// to the message you tapped, so they appear right beneath it.
// ─────────────────────────────────────────────────────────────────────
type MessageActionMenuProps = {
  canEdit: boolean
  canDelete: boolean
  isBusy: boolean
  isDeleteArmed: boolean
  onReply: () => void
  onEdit: () => void
  onDeleteTap: () => void
  onCancel: () => void
}

const MessageActionMenu = memo(({
  canEdit,
  canDelete,
  isBusy,
  isDeleteArmed,
  onReply,
  onEdit,
  onDeleteTap,
  onCancel,
}: MessageActionMenuProps) => {
  const scale = useRef(new Animated.Value(0.92)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 14 }),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start()
  }, [opacity, scale])

  return (
    <Animated.View
      className="mt-2 flex-row flex-wrap items-center gap-2"
      style={{ opacity, transform: [{ scale }] }}
    >
      {/* Reply — always available */}
      <MenuPill
        icon="reply"
        label="Reply"
        color="#D7FF00"
        onPress={onReply}
        disabled={isBusy}
      />

      {/* Edit — own messages only */}
      {canEdit && (
        <MenuPill
          icon="pencil"
          label="Edit"
          color="#87CEEB"
          onPress={onEdit}
          disabled={isBusy}
        />
      )}

      {/* Delete — own or admin. Two-tap armed: first tap turns it into a
          solid red "Confirm", the second tap actually deletes. No system
          dialog is shown, so the flow stays in the message context. */}
      {canDelete && (
        <MenuPill
          icon={isDeleteArmed ? "check" : "delete-outline"}
          label={isDeleteArmed ? "Confirm" : "Delete"}
          color={isDeleteArmed ? "#FFFFFF" : "#FF6B6B"}
          solid={isDeleteArmed}
          onPress={onDeleteTap}
          disabled={isBusy}
        />
      )}
    </Animated.View>
  )
})
MessageActionMenu.displayName = "MessageActionMenu"

type MenuPillProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  label: string
  color: string
  onPress: () => void
  disabled?: boolean
  solid?: boolean
}
const MenuPill = memo(({ icon, label, color, onPress, disabled, solid }: MenuPillProps) => (
  <Pressable
    // Action pills live inside a selectable message Pressable. Without
    // stopping propagation, tapping Edit also triggers the parent handler,
    // which dismisses the keyboard and immediately clears editingMessageId.
    onPress={(event) => { event.stopPropagation(); hapticLight(); onPress() }}
    disabled={disabled}
    className="flex-row items-center gap-1 rounded-full px-2.5 py-1.5"
    style={{
      backgroundColor: solid ? "#FF3B30" : `${color}22`,
      borderWidth: 1,
      borderColor: solid ? "#FF3B30" : `${color}44`,
      minHeight: 30,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <MaterialCommunityIcons name={icon} size={12} color={disabled ? "#6F7C73" : color} />
    <Text className="text-[10px] font-bold" style={{ color: disabled ? "#6F7C73" : color }}>
      {label}
    </Text>
  </Pressable>
))
MenuPill.displayName = "MenuPill"

// ─────────────────────────────────────────────────────────────────────
// Main PodcastComments Component
// ─────────────────────────────────────────────────────────────────────
export const PodcastComments = memo(({
  footerPadding,
  messages,
  isLoading = false,
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
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteArmedMessageId, setDeleteArmedMessageId] = useState<string | null>(null)
  // Tracks which message is currently being saved/deleted. Deliberately
  // separate from editingMessageId/actionLoading so the spinner survives
  // the keyboard-hide listener (which clears editingMessageId).
  const [busyMessageId, setBusyMessageId] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState>(null)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)
  const [profileViewerVisible, setProfileViewerVisible] = useState(false)
  const [profileViewerImageUrl, setProfileViewerImageUrl] = useState<string | null>(null)
  const [profileViewerName, setProfileViewerName] = useState('')
  const imageWidth = Math.min(width * 0.72, 280)
  const latestMessageId = messages[messages.length - 1]?.id
  const scrollButtonIcon = isAtBottom ? "chevron-up" : "chevron-down"
  const scrollButtonLabel = isAtBottom ? "Go to first message" : "Go to latest message"

  // Build a map of messageId → index for scroll-to-reply navigation
  const messageIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    messages.forEach((msg, index) => map.set(msg.id, index))
    return map
  }, [messages])

  // ── Scroll helpers ──────────────────────────────────────────────────
  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }))
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
        // fallback
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
    if (isAtBottom) { scrollToFirstMessage(); return }
    scrollToLatestMessage()
  }, [isAtBottom, scrollToFirstMessage, scrollToLatestMessage])

  // ── Auto-scroll on new messages ────────────────────────────────────
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

  // ── Dismiss selections when keyboard hides ─────────────────────────
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setSelectedMessageId(null)
    })
    return () => hideSubscription.remove()
  }, [])

  // ── Snackbar auto-dismiss ──────────────────────────────────────────
  const handleSnackbarDismiss = useCallback(() => setSnackbar(null), [])

  // ── Message press handler (select / deselect) ──────────────────────
  const handleMessagePress = useCallback((messageId: string) => {
    hapticLight()
    Keyboard.dismiss()
    setSelectedMessageId(prev => prev === messageId ? null : messageId)
    setEditingMessageId(null)
  }, [])

  // ── Edit ───────────────────────────────────────────────────────────
  const handleEditStart = useCallback((messageId: string) => {
    hapticLight()
    console.log('[PodcastComments] Opening editor', { messageId })
    setSelectedMessageId(messageId)
    setEditingMessageId(messageId)
  }, [])

  const handleEditSave = useCallback(async (messageId: string, newContent: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    console.log('[PodcastComments] Saving edit', { messageId, contentLength: newContent.trim().length })
    setEditLoading(true)
    let result: ChatActionResult | undefined
    try {
      result = await onEditMessage?.(message, newContent)
    } catch (error) {
      console.error('[PodcastComments] Edit callback threw', { messageId, error })
      result = { ok: false, error: 'Edit request failed before it reached the server.' }
    } finally {
      setEditLoading(false)
    }

    if (result?.ok) {
      setEditingMessageId(null)
      setSelectedMessageId(null)
      setSnackbar({ message: 'Message edited', type: 'success' })
    } else if (result?.error) {
      setSnackbar({ message: result.error, type: 'error' })
    }
  }, [messages, onEditMessage])

  const handleEditCancel = useCallback(() => {
    setEditingMessageId(null)
  }, [])

  // ── Delete (two-tap armed, no system modal) ────────────────────────
  const handleDeleteTap = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    // First tap: arm the confirm state for THIS message
    if (deleteArmedMessageId !== messageId) {
      hapticMedium()
      setDeleteArmedMessageId(messageId)
      setSelectedMessageId(messageId)
      return
    }

    // Second tap: actually delete
    hapticHeavy()
    setDeleteArmedMessageId(null)
    setActionLoading(true)
    setSelectedMessageId(messageId)
    const result = onDeleteMessage?.(message)
    Promise.resolve(result).then((res) => {
      setActionLoading(false)
      if (res?.ok) {
        setSelectedMessageId(null)
        setSnackbar({ message: 'Message deleted', type: 'info' })
      } else if (res?.error) {
        setSnackbar({ message: res.error, type: 'error' })
      }
    })
  }, [messages, onDeleteMessage, deleteArmedMessageId])

  // ── Reply ──────────────────────────────────────────────────────────
  const handleReplyTap = useCallback((messageId: string, senderName: string) => {
    hapticLight()
    onReplyToMessage?.(messageId, senderName)
    setSelectedMessageId(null)
  }, [onReplyToMessage])

  // ── Image viewer ───────────────────────────────────────────────────
  const handleImagePress = useCallback((uri: string) => {
    setSelectedImageUri(uri)
    setIsImageViewerVisible(true)
  }, [])

  const handleCloseImageViewer = useCallback(() => {
    setIsImageViewerVisible(false)
    setSelectedImageUri(null)
  }, [])

  const handleDownloadImage = useCallback(async () => {
    if (!selectedImageUri) return
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to save images to your device.')
        return
      }
      const fileExtension = selectedImageUri.split('.').pop() || 'jpg'
      const fileName = `EMI_Image_${Date.now()}.${fileExtension}`
      const destinationDir = new Directory(Paths.document, 'downloads')
      if (!destinationDir.exists) destinationDir.create()
      const downloadedFile = await File.downloadFileAsync(selectedImageUri, destinationDir)
      await MediaLibrary.saveToLibraryAsync(downloadedFile.uri)
      Alert.alert('Success', 'Image saved to your device gallery!')
    } catch (error) {
      Alert.alert('Error', 'Failed to download image. Please try again.')
      console.error('Download error:', error)
    }
  }, [selectedImageUri])

  // ── List header / empty ────────────────────────────────────────────
  const listHeader = useMemo(() => (
    <View className="mb-5 rounded-2xl bg-menorah-bg/90 px-3.5 py-3">
      <Text className="text-[11px] leading-4 text-[#FFD700]">
        Please keep comments respectful and uplifting. Let your words edify and bring grace to those who hear. — Ephesians 4:29.
      </Text>
    </View>
  ), [])

  const listEmpty = useMemo(() => (
    <View className="mx-2 mt-8 items-center rounded-[24px] border border-white/10 bg-[#0F2A08]/80 px-6 py-8">
      <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#D7FF00]/15">
        <MaterialCommunityIcons name="message-text-outline" size={26} color="#D7FF00" />
      </View>
      <Text className="mt-4 text-[15px] font-semibold text-[#F4F5F0]">
        No messages yet
      </Text>
      <Text className="mt-2 text-center text-[12px] leading-5 text-[#B7C0BC]">
        Start the conversation with an encouraging message for everyone in the room.
      </Text>
    </View>
  ), [])

  const listLoading = useMemo(() => (
    <View className="mx-2 mt-8 items-center rounded-[24px] border border-white/10 bg-[#0F2A08]/80 px-6 py-10">
      <ActivityIndicator size="large" color="#D7FF00" />
      <Text className="mt-4 text-[13px] font-semibold text-[#F4F5F0]">
        Loading messages...
      </Text>
    </View>
  ), [])

  // ── Render a single message ─────────────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: LiveMessage }) => {
    // System messages (room events, e.g. "X joined the live room")
    if (item.message_type === 'system') {
      return (
        <View className="mb-2 items-center">
          <View className="flex-row items-center rounded-full bg-white/[0.06] px-2.5 py-1">
            <MaterialCommunityIcons name="account-check-outline" size={10} color="rgba(255,255,255,0.35)" />
            <Text className="ml-1 text-[9px] font-medium tracking-wide text-white/35">
              {item.content}
            </Text>
          </View>
        </View>
      )
    }

    const isOwn = item.isLocal ?? false
    const isSelected = selectedMessageId === item.id
    const isEditing = editingMessageId === item.id
    const userCanDelete = canDeleteMessage?.(item) ?? false
    const userCanEdit = canEditMessage?.(item) ?? false
    const hasReply = item.reply_to_id && item.reply_preview
    const isBusy = actionLoading && selectedMessageId === item.id
    const isEditingInFlight = editLoading && isEditing

    return (
      <Pressable
        onPress={() => handleMessagePress(item.id)}
        className={`mb-3.5 ${isOwn ? "items-end" : "items-start"}`}
      >
        <View className={`flex-row ${isOwn ? "flex-row-reverse" : ""}`}>
          {/* Avatar */}
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
                source={{ uri: item.sender_avartar_url }}
                style={{ width: 30, height: 30, borderRadius: 15 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{ width: 30, height: 30, borderRadius: 15 }}
                className="items-center justify-center bg-menorah-primary"
              >
                <Text className="text-base font-bold text-menorah-bg">
                  {item.sender_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Content */}
          <View
            className={`${isOwn ? "items-end mr-3" : "items-start ml-3"}`}
            style={{ maxWidth: width * 0.74 }}
          >
            {/* Sender name */}
            <Text className="mb-1.5 text-[10px] font-medium text-menorah-whiteSoft/90">
              {item.sender_name}
            </Text>

            {/* Reply Preview Banner */}
            {hasReply && item.reply_preview && (
              <ReplyPreviewBanner
                replyPreview={item.reply_preview}
                onTap={() => scrollToMessage(item.reply_to_id!)}
                isOwn={isOwn}
              />
            )}

            <View className="flex-row items-end">
              {/* Message Bubble / Edit Input */}
              <View style={{ opacity: isBusy ? 0.45 : 1 }}>
                {isEditing ? (
                  <EditMessageInput
                    initialContent={item.content}
                    onSave={(newContent) => handleEditSave(item.id, newContent)}
                    onCancel={handleEditCancel}
                    isLoading={editLoading}
                  />
                ) : (
                  <>
                    {item.message_type === 'image' ? (
                      <ChatImage uri={item.content} maxWidth={imageWidth} onPress={handleImagePress} />
                    ) : (
                      <View
                        className={`rounded-2xl px-4 py-3 ${isOwn ? "rounded-br-md bg-[#D7FF00]" : "self-start rounded-bl-md bg-white/20"} ${isSelected ? 'border-2 border-[#D7FF00]' : ''}`}
                        style={{
                          maxWidth: width * 0.68,
                          minHeight: 44,
                          shadowColor: '#000',
                          shadowOpacity: 0.18,
                          shadowRadius: 5,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 2,
                        }}
                      >
                        <Text className={`text-[13px] font-semibold leading-5 ${isOwn ? 'text-[#143703]' : 'text-menorah-whiteSoft'}`}>
                          {item.content}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* In-flight indicator — shown while editing or deleting this message */}
              {(isBusy || isEditingInFlight) && (
                <View className="ml-2 mb-1 h-7 w-7 items-center justify-center rounded-full bg-[#0F2A08]/90 border border-[#D7FF00]/30">
                  <ActivityIndicator size="small" color="#D7FF00" />
                </View>
              )}
            </View>

            {/* Timestamp, plus an "edited" marker when applicable */}
            {!isEditing && (
              <Text className="mt-1 text-[9px] text-white/35">
                {new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {item.edited_at ? " · edited" : ""}
              </Text>
            )}

            {/* Anchored action menu — appears directly under the bubble */}
            {isSelected && !isEditing && (
              <MessageActionMenu
                canEdit={userCanEdit}
                canDelete={userCanDelete}
                isBusy={isBusy}
                isDeleteArmed={deleteArmedMessageId === item.id}
                onReply={() => handleReplyTap(item.id, item.sender_name)}
                onEdit={() => handleEditStart(item.id)}
                onDeleteTap={() => handleDeleteTap(item.id)}
                onCancel={() => {
                  hapticLight()
                  setDeleteArmedMessageId(null)
                  setSelectedMessageId(null)
                }}
              />
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
    editLoading,
    actionLoading,
    deleteArmedMessageId,
    canDeleteMessage,
    canEditMessage,
    handleMessagePress,
    handleEditSave,
    handleEditCancel,
    handleDeleteTap,
    handleReplyTap,
    handleImagePress,
    scrollToMessage,
  ])

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <View className="relative min-h-[220px] flex-1">
      {/* Tap backdrop to deselect message */}
      {selectedMessageId && !editingMessageId && (
        <Pressable
          onPress={() => setSelectedMessageId(null)}
          className="absolute inset-0 z-0"
        />
      )}

      <FlashList
        ref={listRef}
        data={messages}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isLoading ? listLoading : listEmpty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: footerPadding + (selectedMessageId ? 80 : 0) }}
        ListHeaderComponent={listHeader}
        onContentSizeChange={handleContentSizeChange}
        onLoad={() => scrollToLatestMessage(false)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={renderMessage}
        extraData={{ selectedMessageId, editingMessageId, editLoading, actionLoading, deleteArmedMessageId }}
      />

      {/* Scroll-to-top / latest button */}
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

      {/* Snackbar feedback */}
      <Snackbar state={snackbar} onDismiss={handleSnackbarDismiss} />

      {/* Image Viewer */}
      <ImageViewer
        visible={isImageViewerVisible}
        imageUri={selectedImageUri}
        onClose={handleCloseImageViewer}
        onDownload={handleDownloadImage}
      />

      {/* Profile Viewer */}
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
  )
})
PodcastComments.displayName = "PodcastComments"

// ─────────────────────────────────────────────────────────────────────
// usePodcastFooterLayout
// ─────────────────────────────────────────────────────────────────────
export const usePodcastFooterLayout = () => {
  const insets = useSafeAreaInsets()
  const [footerHeight, setFooterHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const footerBottom = useMemo(
    () => keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom) : 0,
    [insets.bottom, keyboardHeight]
  )
  const scrollPaddingBottom = useMemo(
    () => footerHeight + footerBottom + 24,
    [footerBottom, footerHeight]
  )

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height)
  }, [])

  return {
    footerBottom,
    footerPaddingBottom: insets.bottom > 0 ? insets.bottom : 16,
    scrollPaddingBottom,
    handleFooterLayout,
  }
}

// ─────────────────────────────────────────────────────────────────────
// PodcastBottomDock
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastBottomSheet
// ─────────────────────────────────────────────────────────────────────
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
}

// ─────────────────────────────────────────────────────────────────────
// PodcastDialog
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastNotesDialog
// ─────────────────────────────────────────────────────────────────────
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
          <Text className="text-[10px] uppercase tracking-[1px] text-[#D7FF00]">Playlist</Text>
          <Text className="mt-1 text-[15px] font-semibold text-[#F4F5F0]" numberOfLines={2}>
            {playlist}
          </Text>
        </View>
        <View className="rounded-[16px] bg-white/5 px-3 py-3">
          <Text className="text-[10px] uppercase tracking-[1px] text-[#D7FF00]">Title</Text>
          <Text className="mt-1 text-[15px] font-semibold text-[#F4F5F0]" numberOfLines={3}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={() => { hapticMedium(); onClose() }}
          className="mt-5 items-center rounded-[16px] bg-[#D7FF00] px-4 py-3"
        >
          <Text className="text-[14px] font-semibold text-[#143703]">Close</Text>
        </Pressable>
      </View>
    </View>
  </PodcastDialog>
);

// ─────────────────────────────────────────────────────────────────────
// PodcastConnectingOverlay
// ─────────────────────────────────────────────────────────────────────
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
        <Text className="mt-6 text-[20px] font-semibold text-[#F4F5F0]">Connecting...</Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-[#B7C0BC]">
          Joining the live podcast room. Please hold on for a moment.
        </Text>
      </View>
    </View>
  ) : null
);

// ─────────────────────────────────────────────────────────────────────
// PodcastFullScreenModal
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PodcastBackground
// ─────────────────────────────────────────────────────────────────────
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
      />
    )}
    {children}
  </View>
);
