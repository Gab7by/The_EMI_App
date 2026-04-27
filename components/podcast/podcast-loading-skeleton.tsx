import {View} from "react-native"
import { Skeleton } from "../ui/skeleton"
import { Colors } from "@/constants/theme"

const PodcastLoadingSkeleton = () => {
    return (
        <View className="py-5">
            <Skeleton style={{backgroundColor: Colors.menorah.darkGreen}} className="h-[250px] w-[350px]" />
        </View>
    )
}

export default PodcastLoadingSkeleton