import { Pressable, Text, View } from "react-native"
import { Icon } from "@/components/ui/icon"
import { Colors } from "@/constants/theme"
import type { LucideIcon } from "lucide-react-native"
import { memo } from "react"

type GivingRowProps = {
    icon: LucideIcon
    title: string
    description?: string
    iconColor?: string
    onPress: () => void
}

const GivingRow = ({ icon, title, description, iconColor, onPress }: GivingRowProps) => {
    const backgroundColor = iconColor ?? Colors.menorah.primary

    return (
        <Pressable onPress={onPress} className="p-4 bg-menorah-darkGreen rounded-xl active:bg-white/5">
            <View className="flex-row items-center">
                <View className="rounded-full p-2 justify-center mr-4" style={{ backgroundColor }}>
                    <Icon as={icon} size={24} className="text-menorah-bg" />
                </View>
                <View className="flex-1 justify-center gap-0.5">
                    <Text className="text-white font-bold text-base">{title}</Text>
                    {description ? (
                        <Text className="text-menorah-muted text-xs">{description}</Text>
                    ) : null}
                </View>
            </View>
        </Pressable>
    )
}

export default memo(GivingRow)