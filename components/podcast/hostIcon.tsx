import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"
import { Colors } from "@/constants/theme"

const HostIcon = ({hostName, hostPictureUrl}: {hostPictureUrl: string | null, hostName: string}) => {
    
    return (
        <View
            style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            {
                hostPictureUrl ? (
                    <Image
                        source={{uri: hostPictureUrl}}
                        style={{width: 40, height: 40, borderRadius: 20}}
                    />
                ) : (
                    <View style={{width: 40, height: 40, borderRadius: 20}} className="bg-menorah-primary items-center justify-center">
                        <Text className="text-menorah-bg font-bold text-lg">
                            {hostName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )
            }
        </View>
    )
}

export default HostIcon