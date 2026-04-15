import { useProfileStore } from "@/store/profileStore"
import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"

const ProfileIcon = ({borderColor}: {borderColor: string}) => {
    
    const profileImageUrl = useProfileStore(state => state.profileImageUrl)
    const name = "Benedict"

    return (
        <Pressable
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