import ProfileCategory from "@/components/profile/profileCategory"
import ProfileModalIcon from "@/components/profile/profileModalIcon"
import { ProfileManagementCategories } from "@/constants/profile"
import { Colors } from "@/constants/theme"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import {  Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ProfileEntryScreen = () => {

    const router = useRouter()

    const name = useAuthStore(state => state.session?.user.user_metadata.full_name)
    const email = useAuthStore(state => state.session?.user.email)

    const goToPreviousScreen = () => {
        router.back()
    }

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-8">
            <View className="flex-row gap-2 items-center">
                <Pressable onPress={goToPreviousScreen}>
                    <ArrowLeft size={26} color="white" />
                </Pressable>
            </View>
            <View className="gap-4">
                <View className="items-center">
                    <ProfileModalIcon borderColor={Colors.menorah.primary} />
                </View>
                <View className="items-center">
                    <Text className="text-lg text-white font-bold" numberOfLines={2}>{name}</Text>
                    <Text className="text-menorah-muted text-xs">{email}</Text>
                </View>
            </View>
            <View className="gap-4">
                {
                    ProfileManagementCategories.map(category => (
                        <ProfileCategory key={category.key} categoryName={category.categoryName} icon={category.icon} categoryDescription={category.categoryDescription} categoryIconColor={category.categoryIconColor} onPressFunction={category.onPressFunction}  />
                    ))
                }
            </View>
        </SafeAreaView>
    )
}

export default ProfileEntryScreen