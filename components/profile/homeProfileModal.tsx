import { Colors } from "@/constants/theme"
import { hapticMedium } from "@/lib/haptics"
import { useAuthStore } from "@/store/authStore"
import { useHomeProfileModalStore } from "@/store/homeStore"
import { useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"
import Modal from "react-native-modal"
import ProfileModalIcon from "./profileModalIcon"
import { useJoinMenorah } from "@/lib/join-menorah"

const HomeProfileModal = () => {

    const router = useRouter()
    const joinMenorah = useJoinMenorah()

    const isModalOpen = useHomeProfileModalStore(state => state.isOpen)
    const setModalOpen = useHomeProfileModalStore(state => state.setIsOpen)

    const isGuest = useAuthStore(state => state.isGuest)
    const name = useAuthStore(state => state.profile?.full_name ?? state.session?.user.user_metadata.full_name ?? "User")
    const email = useAuthStore(state => state.session?.user.email)

    const routeToProfileScreen = () => {
        hapticMedium()
        setModalOpen(false)
        setTimeout(() => {
            router.push("/(profile)/entry")
        }, 100)
    }

    if (isGuest) {
        return (
            <Modal
                isVisible={isModalOpen}
                animationIn="slideInDown"
                animationOut="slideOutUp"
                animationInTiming={250}
                animationOutTiming={220}
                backdropOpacity={0.35}
                onBackdropPress={() => setModalOpen(false)}
                onBackButtonPress={() => setModalOpen(false)}
                hideModalContentWhileAnimating
                style={{ justifyContent: "flex-start", margin: 0 }}
            >
                <View 
                    className="bg-menorah-darkGreen px-5 pt-14 pb-4 gap-4 rounded-b-2xl"
                    >
                    <View className="items-center">
                        <ProfileModalIcon borderColor={Colors.menorah.lightGray} />
                    </View>
                    <View className="gap-4">
                        <Pressable onPress={joinMenorah} className="bg-menorah-primary rounded-full px-8 py-4 items-center w-full">
                            <Text className="text-menorah-bg font-bold text-base">Join Menorah</Text>
                        </Pressable>
                        <Pressable onPress={routeToProfileScreen} className="bg-white/10 rounded-full px-8 py-4 items-center w-full border border-white/20">
                            <Text className="text-white font-bold text-base">Share App</Text>
                        </Pressable>
                        <Pressable onPress={routeToProfileScreen} className="bg-white/10 rounded-full px-8 py-4 items-center w-full border border-white/20">
                            <Text className="text-white font-bold text-base">Legal</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    return (
        <Modal
            isVisible={isModalOpen}
            animationIn="slideInDown"
            animationOut="slideOutUp"
            animationInTiming={250}
            animationOutTiming={220}
            backdropOpacity={0.35}
            onBackdropPress={() => setModalOpen(false)}
            onBackButtonPress={() => setModalOpen(false)}
            hideModalContentWhileAnimating
            style={{ justifyContent: "flex-start", margin: 0 }}
        >
            <View 
                className="bg-menorah-darkGreen px-5 pt-14 pb-4 gap-4 rounded-b-2xl"
                >
                <View className="items-center">
                    <ProfileModalIcon borderColor={Colors.menorah.lightGray} />
                </View>
                <View className="gap-2 justify-center items-center">
                    <Text className="text-white font-bold text-base">{name}</Text>
                    <View className="flex-row justify-center items-center gap-3">
                        <Text className="text-sm text-menorah-gray">{email}</Text>
                        <View className="bg-menorah-gray h-3 w-[0.5px]" />
                        <Text className="text-sm text-menorah-goldDark">The Menorah</Text>
                    </View>
                </View>
                    <Pressable onPress={routeToProfileScreen} className="bg-menorah-primary rounded-full px-8 py-6 items-center">
                            <Text className="text-menorah-bg font-bold text-base">Manage My Profile</Text>
                    </Pressable>
            </View>
        </Modal>
    )
}

export default HomeProfileModal
