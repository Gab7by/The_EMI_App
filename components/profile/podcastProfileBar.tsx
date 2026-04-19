import { View } from "react-native"
import {Bell} from "lucide-react-native"
import ProfileIcon from "./profileIcon"
import { Colors } from "@/constants/theme"

const PodcastProfileBar = () => {
    return (
        <View className="flex-row justify-between items-center">
            <ProfileIcon borderColor={Colors.menorah.primary}/>
            <Bell color="white" size={25} />
        </View>
    )
}

export default PodcastProfileBar