import { Pressable, Text, View } from "react-native"
import {Image} from "expo-image"

const HostIcon = ({hostName, hostPictureUrl}: {hostPictureUrl?: string, hostName: string}) => {
    
    return (
        <Pressable
            style={{
                borderWidth: 4,
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            {
                hostPictureUrl ? (
                    <Image
                        source={{uri: hostPictureUrl}}
                        style={{width: 26, height: 26, borderRadius: 13}}
                    />
                ) : (
                    <View style={{width: 26, height: 26, borderRadius: 13}} className="bg-menorah-bg items-center justify-center">
                        <Text className="text-menorah-primary font-bold">
                            {hostName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )
            }
        </Pressable>
    )
}

export default HostIcon