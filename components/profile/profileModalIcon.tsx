import { useProfileStore } from "@/store/profileStore"
import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"
import { useAuthStore } from "@/store/authStore"
import { Colors } from "@/constants/theme"

const ProfileModalIcon = ({borderColor}:{borderColor: string}) => {
    
    const profileImageUrl = useProfileStore(state => state.profileImageUrl)
    const name: string = useAuthStore(state => state.session?.user.user_metadata.full_name)

    return (
        <Pressable
            style={{
                borderWidth: 12,
                borderColor: Colors.menorah.darkGray,
                width: 70,
                height: 70,
                borderRadius: 35,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    borderWidth: 4,
                    borderColor: borderColor,
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                {
                    profileImageUrl ? (
                        <Image
                            source={{uri: profileImageUrl}}
                            style={{width: 54, height: 54, borderRadius: 27}}
                        />
                    ) : (
                        <View style={{width: 54, height: 54, borderRadius: 27}} className="bg-menorah-bg items-center justify-center">
                            <Text className="text-menorah-primary font-bold text-2xl">
                                {name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )
                }
            </View>
        </Pressable>
    )
}

export default ProfileModalIcon