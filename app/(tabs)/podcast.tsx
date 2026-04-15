import LiveStreamCard from "@/components/podcast/livestreamCard"
import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import { SafeAreaView } from "react-native-safe-area-context"
import {Plus} from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { View } from "react-native"

const PodcastScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-3 relative">
            <PodcastProfileBar />
            <LiveStreamCard 
                hostName="Rev. Dr.Seth Owusu" 
                playlist="Lunch Prayer Fire"
                title="I will Pray"
                />
            <View className="items-center absolute bottom-32 left-4 right-4">
                <Button className="bg-menorah-primary rounded-full">
                    <Plus size={35} color="white" />
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default PodcastScreen