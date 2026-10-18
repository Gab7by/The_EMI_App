import { hapticMedium } from "@/lib/haptics"
import { useJoinMenorah } from "@/lib/join-menorah"
import { LiveStreamCardType } from "@/types/podcast-types"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { memo, useCallback } from "react"
import { Pressable, Text, View } from "react-native"
import HostIcon from "./hostIcon"

const GuestLiveStreamCard = ({ title, playlist, hostPictureUrl, hostName, coverImageUrl }: Pick<LiveStreamCardType, "title" | "playlist" | "hostPictureUrl" | "hostName" | "coverImageUrl">) => {
    const joinMenorah = useJoinMenorah()

    const handleJoin = useCallback(() => {
        hapticMedium()
        joinMenorah()
    }, [joinMenorah])

    return (
        <Pressable onPress={handleJoin} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#10321D] active:opacity-90">
            <Image
                source={coverImageUrl ? { uri: coverImageUrl } : require("@/assets/pictures/podcast-livestream-image.png")}
                style={{ width: '100%', height: 176, position: 'absolute', top: 0, left: 0 }}
                contentFit="cover"
            />
            <LinearGradient colors={['rgba(7,22,11,0.18)', 'rgba(7,22,11,0.96)']} style={{ minHeight: 176, padding: 18, justifyContent: 'space-between' }}>
                <View className="self-start flex-row items-center rounded-full border border-[#C6FF00]/35 bg-[#07160B]/75 px-2.5 py-1">
                    <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#C6FF00]" />
                    <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#C6FF00]">Live now</Text>
                </View>
                <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#C6FF00]" numberOfLines={1}>{playlist}</Text>
                    <Text className="mt-1 text-[19px] font-bold text-white" numberOfLines={2}>{title}</Text>
                    <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <HostIcon hostName={hostName} hostPictureUrl={hostPictureUrl} />
                            <Text className="ml-2 text-xs font-semibold text-white/85" numberOfLines={1}>{hostName}</Text>
                        </View>
                        <View className="rounded-full bg-[#C6FF00] px-3 py-1.5">
                            <Text className="text-[10px] font-bold text-[#0B1F0E]">Join to listen live</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </Pressable>
    )
}

export default memo(GuestLiveStreamCard)