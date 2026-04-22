import Sun from "@/assets/svgs/sun-icon.svg"
import { Image } from "expo-image"
import { Text, View } from "react-native"
import HostIcon from "./hostIcon"

const LiveStreamCard = ({hostName, hostPictureUrl, playlist, title}:{playlist: string, title: string, hostPictureUrl?: string, hostName: string}) => {
    return (
        <View className="gap-4">
            <Text className="text-menorah-goldDark text-xl font-bold relative">Livestream</Text>
            <View className="rounded-lg bg-menorah-darkGreen pt-6 px-5 pb-4 gap-10">
                <View className="gap-2 relative">
                    <Text className="text-menorah-primary text-2xl font-bold">{playlist}</Text>
                    <Text className="text-menorah-gray text-sm">Title: {title}</Text>
                    <Sun style={{position: "absolute", bottom: -16, left: 16}} />
                </View>
                <View className="gap-4">
                    <HostIcon hostName={hostName} hostPictureUrl={hostPictureUrl} />
                    <Text className="text-white text-sm">Host: {hostName}</Text>
                </View>
            </View>
            <Image
                source={require("@/assets/pictures/podcast-livestream-image.png")}
                style={{width: 170, height: 100, position: "absolute", right: 0, bottom: 0}}
                contentFit="cover"
            />
        </View>
    )
}

export default LiveStreamCard