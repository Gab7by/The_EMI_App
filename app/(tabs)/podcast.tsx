import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import { SafeAreaView } from "react-native-safe-area-context"

const PodcastScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-menorah-bg p-8">
            <PodcastProfileBar />
        </SafeAreaView>
    )
}

export default PodcastScreen