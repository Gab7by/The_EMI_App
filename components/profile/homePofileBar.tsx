import { View } from "react-native"
import {Bell} from "lucide-react-native"
import { Colors } from "@/constants/theme"
import HomeProfileIcon from "./homeProfileIcon"

const HomeProfileBar = () => {

    return (
        <View className="flex-row justify-between items-center">
            <HomeProfileIcon borderColor={Colors.menorah.primary}/>
            <Bell color="white" size={25} />
        </View>
    )
}

export default HomeProfileBar