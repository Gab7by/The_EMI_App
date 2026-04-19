import { Modal, Pressable, Text, TextInput, View } from "react-native"
import {BlurView} from "expo-blur"
import { useLiveStreamInfoModalStore, useLiveStreamStartDialogModalStore, useLiveStreamStartModalStore } from "@/store/podcast-store"
import { ArrowLeft } from "lucide-react-native"
import { Colors } from "@/constants/theme"
import { LiveStreamInfoType } from "@/types/podcast-types"
import { useRouter } from "expo-router"

const LiveStreamInfoModal = ({about, setAbout, setTitle, title}:LiveStreamInfoType) => {

    const router = useRouter()

    const isModalOpen = useLiveStreamInfoModalStore(state => state.isOpen)
    const setModalOpen = useLiveStreamInfoModalStore(state => state.setIsOpen)

    const setDialogModalOpen = useLiveStreamStartDialogModalStore(state => state.setIsOpen)

    const goBackToDialogModal = () => {
        setModalOpen(false)
        setTimeout(() => {
            setDialogModalOpen(true)
        }, 100)
    }

    const startLiveStream = () => {
        setModalOpen(false)
        setTimeout(() => {
            router.push("/podcast/livePodcastAdmin")
        }, 100)
    }

    return (
        <Modal
            visible={isModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setModalOpen(false)}
            style={{backgroundColor: "transparent", flex: 1}}
        >
            <BlurView
                intensity={20}
                tint="dark"
                style={{ flex:  1}}
                onTouchEnd={() => setModalOpen(false)}
            />

            <View 
                className="bg-menorah-darkGreen px-5 gap-7"
                style={{
                    flex: 2
                }}
                >
                <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                <View className="flex-1 gap-7">
                    <View className="flex-row">
                        <Pressable onPress={goBackToDialogModal}>
                            <ArrowLeft size={28} color={Colors.menorah.primary} />
                        </Pressable>
                        <View className="flex-1 items-center">
                            <Text className="text-menorah-primary text-lg font-bold">Livestream Information</Text>
                        </View>
                    </View>
                    <View className="border border-menorah-primary p-5 rounded-2xl gap-1">
                        <Text className="text-menorah-primary text-base">Live Title</Text>
                        <TextInput
                            inputMode="text"
                            value={title}
                            onChangeText={(text) => setTitle(text)}
                            placeholder="Live Title"
                            placeholderTextColor={`${Colors.menorah.primary}40`}
                            className="text-menorah-whiteSoft text-base"
                        />
                    </View>
                    <View className="border border-menorah-primary p-5 rounded-2xl gap-1">
                        <Text className="text-menorah-primary text-base">About this livestream</Text>
                        <TextInput
                            inputMode="text"
                            value={about}
                            onChangeText={(text) => setAbout(text)}
                            placeholder="About this livestream"
                            placeholderTextColor={`${Colors.menorah.primary}40`}
                            className="text-menorah-whiteSoft text-base"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                    <Pressable onPress={startLiveStream} className="bg-menorah-primary rounded-full flex-row px-8 py-6 justify-center">
                            <Text className="text-menorah-bg font-bold text-base">Start Now</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default LiveStreamInfoModal