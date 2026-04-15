import LiveStreamCard from "@/components/podcast/livestreamCard"
import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import { SafeAreaView } from "react-native-safe-area-context"

const PodcastScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-3">
            <PodcastProfileBar />
            <LiveStreamCard 
                hostName="Rev. Dr.Seth Owusu" 
                playlist="Lunch Prayer Fire"
                title="I will Pray"
                />
        </SafeAreaView>
    )
}

export default PodcastScreen