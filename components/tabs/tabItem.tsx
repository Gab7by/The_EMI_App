import { ACTIVE_COLOR, ICONS, LABELS, tabStyles as styles } from "@/constants/tabs"
import { hapticMedium } from "@/lib/haptics"
import { House } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"

const CustomTabItem = ({route, isActive, onPress}: {route: any, isActive: boolean, onPress: () => void}) => {

    const Icon = ICONS[route.name as keyof typeof ICONS] ?? House
    const label = LABELS[route.name as keyof typeof LABELS] ?? route.name

    const handlePress = () => {
        hapticMedium()
        onPress()
    }

    return (
        <Pressable style={[styles.tabButton, isActive && styles.tabActive]} onPress={handlePress}>
            <View style={[styles.tab]}>
                <Icon 
                    size={30}
                    color={isActive ? ACTIVE_COLOR : "white"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                />
                <Text style={[styles.label, {color: isActive ? ACTIVE_COLOR : "white"}]} numberOfLines={1}>
                    {label}
                </Text>
            </View>
        </Pressable>
    )
}

export default CustomTabItem
