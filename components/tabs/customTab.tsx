import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CustomTabItem from "./tabItem"
import { tabStyles as styles } from "@/constants/tabs"

const CustomTab = ({state, navigation}: BottomTabBarProps) => {
    const insets = useSafeAreaInsets()
    
    return (
        <View style={[styles.wrapper, {bottom: Math.max(insets.bottom, 16) + 8}]}>
            <View style={styles.container}>
                {
                    state.routes.map((route, index) => (
                        <CustomTabItem 
                            key={route.key}
                            route={route}
                            isActive={state.index === index}
                            onPress={() => navigation.navigate(route.name)}
                        />
                    ))
                }
            </View>
        </View>
    )
}

export default CustomTab