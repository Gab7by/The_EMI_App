import { RefreshControl, ScrollView, View } from "react-native"
import { Skeleton } from "../ui/skeleton"

const PodcastLoadingSkeleton = () => {
    return (
        <ScrollView className="gap-5">
            <Skeleton className="h-[70px] w-[300px]" />
            <Skeleton className="h-[70px] w-[300px]" />
            <Skeleton className="h-[70px] w-[300px]" />
        </ScrollView>
    )
}

export default PodcastLoadingSkeleton