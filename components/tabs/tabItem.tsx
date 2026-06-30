import { ACTIVE_COLOR, ICONS, LABELS, tabStyles as styles } from "@/constants/tabs"
import { hapticMedium } from "@/lib/haptics"
import { Pressable, Text, View } from "react-native"

const CustomTabItem = ({route, isActive, onPress}: {route: any, isActive: boolean, onPress: () => void}) => {

    const Icon = ICONS[route.name as keyof typeof ICONS]
    const label = LABELS[route.name as keyof typeof LABELS] ?? route.name

    const handlePress = () => {
        hapticMedium()
        onPress()
    }

    if (isActive) {
        return (
            <Pressable style={styles.tabButtonActive} onPress={handlePress}>
                <View style={styles.tabRow}>
                    <Icon 
                        size={26}
                        color={ACTIVE_COLOR}
                        strokeWidth={2.5}
                    />
                    <Text style={styles.label} numberOfLines={1}>
                        {label}
                    </Text>
                </View>
            </Pressable>
        )
    }

    return (
        <Pressable style={styles.tabButtonInactive} onPress={handlePress}>
            <Icon 
                size={26}
                color="white"
                strokeWidth={1.8}
            />
        </Pressable>
    )
}

export default CustomTabItem