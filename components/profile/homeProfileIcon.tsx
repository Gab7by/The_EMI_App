import { useProfileStore } from "@/store/profileStore"
import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"
import { ChevronDown } from "lucide-react-native"
import { Colors } from "@/constants/theme"

const HomeProfileIcon = ({borderColor}: {borderColor: string}) => {
    
    const profileImageUrl = useProfileStore(state => state.profileImageUrl)
    const name = "Benedict"

    return (
        <Pressable className="flex-row gap-2 items-center">
            <View
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
            </View>
            <View>
                <Text className="text-white font-bold">Hi {name}</Text>
                <Text className="text-white">Welcome Home</Text>
            </View>
            <ChevronDown color="white" size={28} />
        </Pressable>
    )
}

export default HomeProfileIcon