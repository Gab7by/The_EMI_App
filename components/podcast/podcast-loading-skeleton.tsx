import {View} from "react-native"
import { Skeleton } from "../ui/skeleton"
import { Colors } from "@/constants/theme"

const PodcastLoadingSkeleton = () => {
    return (
        <View className="py-5">
            <Skeleton style={{backgroundColor: Colors.menorah.primary}} className="h-[200px] w-[300px]" />
        </View>
    )
}

export default PodcastLoadingSkeleton