import LiveStreamCard from "@/components/podcast/livestreamCard"
import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import { SafeAreaView } from "react-native-safe-area-context"
import {Plus} from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { View } from "react-native"
import { useLiveStreamStartModalStore } from "@/store/podcast-store"
import LiveStreamStartModal from "@/components/podcast/liveStreamStartModal"
import ImageSlider from "@/components/commons/image-slider"
import LiveStreamStartDialogModal from "@/components/podcast/liveStreamStartDialogModal"
import { imageItems } from "@/constants/podcast"
import LiveStreamInfoModal from "@/components/podcast/livestreamInfoModal"
import LiveStreamVisibilityModal from "@/components/podcast/livestreamVisiblityModal"
import { useState } from "react"

const PodcastScreen = () => {

    const [isPublic, setIsPublic] = useState<boolean>(true)
    const [isunlisted, setIsUnlisted] = useState<boolean>(true)

    const [title, setTitle] = useState<string>("Lunch Prayer Fire")
    const [about, setAbout] = useState<string>("")

    const setOpenLiveStreamStartModal = useLiveStreamStartModalStore(state => state.setIsOpen)

    const openLiveStreamStartModal = () => {
        setOpenLiveStreamStartModal(true)
    }

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-4 relative">
            <PodcastProfileBar />
            <ImageSlider items={imageItems}  height={220}/>
            <LiveStreamCard 
                hostName="Rev. Dr.Seth Owusu" 
                playlist="Lunch Prayer Fire"
                title="I will Pray"
                />
            <View className="items-center absolute bottom-32 left-4 right-4">
                <Button onPress={openLiveStreamStartModal} size="icon" className="bg-menorah-primary p-7 rounded-full">
                    <Plus size={35} color="white" />
                </Button>
            </View>
            <LiveStreamStartModal />
            <LiveStreamStartDialogModal isPublic={isPublic} title={title} />
            <LiveStreamInfoModal about={about} title={title} setAbout={setAbout} setTitle={setTitle} />
            <LiveStreamVisibilityModal isPublic={isPublic} isUnlisted={isunlisted} setIsPublic={setIsPublic} setIsUnlisted={setIsUnlisted} />
        </SafeAreaView>
    )
}

export default PodcastScreen