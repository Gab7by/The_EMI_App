import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type LearningPathCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  moduleCount: number;
  locked?: boolean;
  onPress?: () => void;
};

const LearningPathCard = ({
  icon,
  title,
  description,
  moduleCount,
  locked = true,
  onPress,
}: LearningPathCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-[22px] border border-white/10 bg-[#10321D] p-4 active:bg-white/5"
    >
      {/* Icon */}
      <View className="h-12 w-12 items-center justify-center rounded-2xl border border-[#C6FF00]/20 bg-[#C6FF00]/10">
        <MaterialCommunityIcons name={icon} size={24} color="#C6FF00" />
      </View>

      {/* Title / Description / Modules */}
      <View className="ml-4 flex-1 gap-0.5">
        <Text className="text-[15px] font-bold text-white" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs leading-4 text-menorah-muted" numberOfLines={2}>
          {description}
        </Text>
        <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-menorah-muted/70">
          {moduleCount} modules · coming soon
        </Text>
      </View>

      {/* Lock indicator */}
      {locked ? (
        <MaterialCommunityIcons
          name="lock-outline"
          size={18}
          color="#8A9A90"
          style={{ marginLeft: 8 }}
        />
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#C6FF00"
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
};

export default memo(LearningPathCard);
