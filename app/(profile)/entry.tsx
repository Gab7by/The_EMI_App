import ProfileCategory from "@/components/profile/profileCategory"
import ProfileModalIcon from "@/components/profile/profileModalIcon"
import { ProfileManagementCategories } from "@/constants/profile"
import { Colors } from "@/constants/theme"
import { updateProfilePicture } from "@/lib/profile"
import { pickFromCamera, pickImage } from "@/lib/storage"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "expo-router"
import { ArrowLeft, Camera } from "lucide-react-native"
import { useState } from "react"
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ProfileEntryScreen = () => {

    const router = useRouter()

    const name = useAuthStore(state => state.session?.user.user_metadata.full_name)
    const email = useAuthStore(state => state.session?.user.email)
    const profile = useAuthStore(state => state.profile)

    const goToPreviousScreen = () => {
        router.back()
    }

    const [uploading, setUploading] = useState(false)

    const handlePickImage = async (source: 'camera' | 'library') => {
        const asset = source === 'camera' ? await pickFromCamera() : await pickImage({
            allowsEditing: true,
            aspect: [1, 1]
        })

        if (!asset || !profile) return

        setUploading(true)

        const secure_url = await updateProfilePicture(profile.id, asset, profile.avatar_url)

        if (secure_url) {
            await useAuthStore.getState().fetchProfile(profile.id)
            setUploading(false)
        } else {
            setUploading(false)
            Alert.alert("Error", "There was an error uploading your profile picture. Please try again.")
        }
    }

    const handleCameraPress = () => {
        Alert.alert("Change Profile Picture", "Choose a source", [
            { text: "Camera", onPress: () => handlePickImage('camera') },
            { text: "Photo Library", onPress: () => handlePickImage('library') },
            { text: "Cancel", style: "cancel" }
        ])
    }
    

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-8">
            <View className="flex-row gap-2 items-center">
                <Pressable onPress={goToPreviousScreen}>
                    <ArrowLeft size={26} color="white" />
                </Pressable>
            </View>
            <View className="gap-4">
                {
                    uploading ? (
                        <View className="items-center">
                            <ActivityIndicator size="large" color={Colors.menorah.primary} />
                        </View>
                    ) : (
                        <View className="items-center">
                            <Pressable className="relative" onPress={handleCameraPress}>
                                <ProfileModalIcon borderColor={Colors.menorah.primary} />
                                <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-menorah-primary items-center justify-center">
                                    <Camera size={14} color="#000" />
                                </View>
                            </Pressable>
                        </View>
                    )
                }
                    <View className="items-center gap-1">
                        <Text className="text-white text-lg font-bold" numberOfLines={2}>
                            {name}
                        </Text>
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