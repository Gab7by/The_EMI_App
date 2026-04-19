import { Modal, Pressable, Text, TextInput, View } from "react-native"
import {BlurView} from "expo-blur"
import { useLiveStreamStartDialogModalStore, useLiveStreamVisibilityModalStore } from "@/store/podcast-store"
import { ArrowLeft, Earth, EyeOff  } from "lucide-react-native"
import { Colors } from "@/constants/theme"
import { LiveStreamVisibilityOptionsType } from "@/types/podcast-types"

const LiveStreamVisibilityModal = ({isPublic, isUnlisted, setIsPublic, setIsUnlisted}:LiveStreamVisibilityOptionsType) => {

    const isModalOpen = useLiveStreamVisibilityModalStore(state => state.isOpen)
    const setModalOpen = useLiveStreamVisibilityModalStore(state => state.setIsOpen)

    const setDialogModalOpen = useLiveStreamStartDialogModalStore(state => state.setIsOpen)

    const goBackToDialogModal = () => {
        setModalOpen(false)
        setTimeout(() => {
            setDialogModalOpen(true)
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
                    flex: 1
                }}
                >
                <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                <View className="flex-1 gap-7">
                    <View className="flex-row">
                        <Pressable onPress={goBackToDialogModal}>
                            <ArrowLeft size={28} color={Colors.menorah.primary} />
                        </Pressable>
                        <View className="flex-1 items-center">
                            <Text className="text-menorah-primary text-lg font-bold">Visibility</Text>
                        </View>
                    </View>
                    <View className="flex-1">
                        <View className="flex-row px-2 py-6 justify-between items-center">
                            <Earth size={32} color={Colors.menorah.primary} />
                            <View className="flex-1 ml-5 mr-5">
                                <Text className="text-white font-bold text-base">Public</Text>
                                <Text className="text-menorah-textGray text-sm">
                                Everyone can join the livestream.
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {
                                setIsPublic(prev => !prev)
                                }}
                                className="h-7 w-7 border-2 border-menorah-primary rounded items-center justify-center"
                            >
                                {isPublic && (
                                <View className="h-3 w-3 bg-menorah-primary" />
                                )}
                            </Pressable>
                        </View>
                        <View className="flex-row px-2 py-6 justify-between items-center">
                            <EyeOff size={32} color={Colors.menorah.primary} />

                            <View className="flex-1 ml-5 mr-5">
                                <Text className="text-white font-bold text-base">Unlisted</Text>
                                <Text className="text-menorah-textGray text-sm">
                                Only those with the shared link can join livestream
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {
                                setIsUnlisted(prev => !prev)
                                }}
                                className="h-7 w-7 border-2 border-menorah-primary rounded items-center justify-center"
                            >
                                {isUnlisted && (
                                <View className="h-3 w-3 bg-menorah-primary" />
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default LiveStreamVisibilityModal