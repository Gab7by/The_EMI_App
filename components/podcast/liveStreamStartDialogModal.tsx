import { Modal, Pressable, Text, View } from "react-native"
import {BlurView} from "expo-blur"
import { useLiveStreamInfoModalStore, useLiveStreamStartDialogModalStore, useLiveStreamVisibilityModalStore } from "@/store/podcast-store"
import { Colors } from "@/constants/theme"
import { Wifi, ChevronRight, SunIcon } from "lucide-react-native"

const LiveStreamStartDialogModal = () => {

    const isModalOpen = useLiveStreamStartDialogModalStore(state => state.isOpen)
    const setModalOpen = useLiveStreamStartDialogModalStore(state => state.setIsOpen)

    const setLiveStreamInfoModal = useLiveStreamInfoModalStore(state => state.setIsOpen)
    const setLiveStreamVisibiltyModal = useLiveStreamVisibilityModalStore(state => state.setIsOpen)

    const openLiveStreamInfoModal = () => {
        setModalOpen(false)
        setTimeout(() => {
            setLiveStreamInfoModal(true)
        }, 100)
    }
    
    const openLiveStreamVisibilityModal = () => {
        setModalOpen(false)
        setTimeout(() => {
            setLiveStreamVisibiltyModal(true)
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
                style={{ flex: 3 }}
                onTouchEnd={() => setModalOpen(false)}
            />

            <View 
                className="bg-menorah-darkGreen px-5"
                style={{
                    flex: 2
                }}
                >
                <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                <View className="flex-1">
                    <Pressable onPress={openLiveStreamInfoModal} className="flex-row px-2 py-6 justify-between items-center">
                            <Wifi size={35} color={Colors.menorah.primary} />
                            <View className="flex-1 ml-5">
                                <Text className="text-white font-bold text-base">Live Stream Information</Text>
                                <Text className="text-menorah-textGray text-sm">Lunch Prayer Fire</Text>
                            </View>
                            <ChevronRight size={35} color={Colors.menorah.primary} />
                    </Pressable>
                    <Pressable onPress={openLiveStreamVisibilityModal} className="flex-row px-2 py-6 justify-between items-center">
                            <SunIcon size={35} color={Colors.menorah.primary} />
                            <View className="flex-1 ml-5">
                                <Text className="text-white font-bold text-base">Visibility</Text>
                                <Text className="text-menorah-textGray text-sm">Public</Text>
                            </View>                            
                            <ChevronRight size={35} color={Colors.menorah.primary} />
                    </Pressable>
                    <Pressable onPress={openLiveStreamInfoModal} className="bg-menorah-primary rounded-full flex-row px-8 py-6 justify-center">
                            <Text className="text-menorah-bg font-bold text-base">Start Now</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default LiveStreamStartDialogModal