import { Image } from "expo-image"
import { Text, View } from "react-native"

const NoLiveStreamCard = () => {
    return (
        <View className="items-center rounded-[28px] border border-white/10 bg-[#10321D] px-6 py-8">
            <View className="items-center rounded-[22px] bg-[#C6FF00]/10 p-3">
                <Image
                    source={require("@/assets/pictures/podcast-livestream-image.png")}
                    style={{width: 170, height: 115}}
                    contentFit="cover"
                />
            </View>
            <Text className="mt-5 text-lg font-bold text-white text-center">No live sessions right now</Text>
            <Text className="mt-2 text-center text-sm leading-5 text-menorah-muted">When a live podcast begins, you will see it here.</Text>
        </View>
    )
}

export default NoLiveStreamCard
