import { Image } from "expo-image"
import { Text, View } from "react-native"

const NoLiveStreamCard = () => {
    return (
        <View className="gap-5">
            <View className="items-center">
                <Image
                    source={require("@/assets/pictures/podcast-livestream-image.png")}
                    style={{width: 220, height: 150}}
                    contentFit="cover"
                />
            </View>
            <Text className="text-lg text-menorah-primary text-center">No Public livestreams ongoing</Text>
        </View>
    )
}

export default NoLiveStreamCard