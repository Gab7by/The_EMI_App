import { Pressable, Text, View } from "react-native"
import Modal from "react-native-modal"
import { useHomeProfileModalStore } from "@/store/homeStore"
import { useAuthStore } from "@/store/authStore"
import ProfileModalIcon from "./profileModalIcon"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/theme"

const HomeProfileModal = () => {

    const router = useRouter()

    const isModalOpen = useHomeProfileModalStore(state => state.isOpen)
    const setModalOpen = useHomeProfileModalStore(state => state.setIsOpen)

    const name = useAuthStore(state => state.session?.user.user_metadata.full_name)
    const email = useAuthStore(state => state.session?.user.email)

    const routeToProfileScreen = () => {
        setModalOpen(false)
        setTimeout(() => {
            router.push("/(profile)/entry")
        }, 100)
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