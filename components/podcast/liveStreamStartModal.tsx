import { Modal, Text, View } from "react-native"
import {BlurView} from "expo-blur"
import { useLiveStreamStartModalStore } from "@/store/podcast-store"
import { Colors } from "@/constants/theme"
import { Button } from "../ui/button"
import { Send, SendHorizonal } from "lucide-react-native"

const LiveStreamStartModal = () => {

    const isModalOpen = useLiveStreamStartModalStore(state => state.isOpen)
    const setModalOpen = useLiveStreamStartModalStore(state => state.setIsOpen)

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
                tint="regular"
                style={{ flex: 5 }}
                onTouchEnd={() => setModalOpen(false)}
            />

            <View 
                className="bg-menorah-darkGreen px-5 pb-5"
                style={{
                    flex: 1
                }}
                >
                <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                <View className="justify-center flex-1">
                    <Button size="lg" className="bg-menorah-primary rounded-full">
                        <View className="flex-row justify-between w-full">
                            <Text className="text-menorah-bg font-bold text-base">Start New Livestream</Text>
                            <SendHorizonal color={Colors.menorah.bg} />
                        </View>
                    </Button>
                </View>
            </View>
        </Modal>
    )
}

export default LiveStreamStartModal