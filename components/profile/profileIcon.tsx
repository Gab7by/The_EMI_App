import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "expo-router"

const ProfileIcon = ({borderColor}: {borderColor: string}) => {
    
    const profileImageUrl = useAuthStore(state => state.profile?.avatar_url)
    const name: string = useAuthStore(state => state.session?.user.user_metadata.full_name)

    const router = useRouter()


    return (
        <Pressable
            onPress={() => router.push("/(profile)/entry")}
            style={{
                borderWidth: 4,
                borderColor,
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            {
                profileImageUrl ? (
                    <Image
                        source={{uri: profileImageUrl}}
                        style={{width: 26, height: 26, borderRadius: 13}}
                        contentFit="cover"
                    />
                ) : (
                    <View style={{width: 26, height: 26, borderRadius: 13}} className="bg-menorah-bg items-center justify-center">
                        <Text className="text-menorah-primary font-bold">
                            {name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )
            }
        </Pressable>
    )
}

export default ProfileIcon