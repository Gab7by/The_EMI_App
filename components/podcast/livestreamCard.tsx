import Sun from "@/assets/svgs/sun-icon.svg"
import { hapticMedium } from "@/lib/haptics"
import { useAuthStore } from "@/store/authStore"
import { LiveStreamCardType } from "@/types/podcast-types"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { memo, useCallback } from "react"
import { Pressable, Text, View } from "react-native"
import HostIcon from "./hostIcon"

const LiveStreamCard = ({
    hostName,
    hostPictureUrl,
    playlist, 
    title,
    hostId,
    id,
    livekitRoomName,
    coverImageUrl
}:LiveStreamCardType) => {

    const profile = useAuthStore(state => state.profile)
    const isAdmin = profile?.role === "admin"

    const router = useRouter()

    const goToLiveStream = useCallback(() => {
        hapticMedium()
        if(isAdmin) router.push(
            {
                pathname: "/(podcast)/live-podcast-admin",
                params: {
                    id,
                    title,
                    playlist,
                    hostId,
                    hostName,
                    hostPictureUrl,
                    livekitRoomName,
                    coverImageUrl
                }
            }
        );
        else router.push(
            {
                pathname: "/(podcast)/live-podcast-member",
                params: {
                    id,
                    title,
                    playlist,
                    hostId,
                    hostName,
                    hostPictureUrl,
                    livekitRoomName,
                    coverImageUrl
                }
            }
        )
    }, [coverImageUrl, hostId, hostName, hostPictureUrl, id, isAdmin, livekitRoomName, playlist, router, title])

    return (
        <Pressable onPress={goToLiveStream}>
            <View className="rounded-lg bg-menorah-darkGreen pt-6 px-5 pb-4 gap-10">
                <View className="gap-2">
                    <Text className="text-menorah-primary text-2xl font-bold">{playlist}</Text>
                    <View className="gap-2 flex-row">
                        <Text className="text-menorah-gray text-sm">Title: {title}</Text>
                        <Sun />
                    </View>
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
        </Pressable>
    )
}

export default memo(LiveStreamCard)
