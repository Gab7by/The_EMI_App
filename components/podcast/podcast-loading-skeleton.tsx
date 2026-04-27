import {View} from "react-native"
import { Skeleton } from "../ui/skeleton"

const PodcastLoadingSkeleton = () => {
    return (
        <View className="gap-5">
            <Skeleton className="h-[50px] w-[300px]" />
            <Skeleton className="h-[50px] w-[300px]" />
            <Skeleton className="h-[50px] w-[300px]" />
        </View>
    )
}

export default PodcastLoadingSkeleton