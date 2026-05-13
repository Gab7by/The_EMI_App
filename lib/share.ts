import * as Linking from "expo-linking"
import { Share } from "react-native"

export const shareLivePodcast = async (params: {
    podcastId: string,
    title: string,
    hostName: string,
    playlist: string
}) => {

    const shareUrl = `${process.env.EXPO_PUBLIC_SHARE_BASE_URL}?id=${params.podcastId}`
    
    const isLive = true

    // const deepLink = Linking.createURL(
    //     '(podcast)/join', {
    //         queryParams: {
    //             id: params.podcastId
    //         }
    //     }
    // )
    console.log("Generated share URL:", shareUrl)

    try {
        await Share.share({
            message: `${isLive ? '🔴 Live Now · ' : ''}${params.title}\n${params.playlist} · The Menorah\n\n${shareUrl}`,
            title: params.title,
        })
    } catch (error) {
        console.error("Error sharing:", error)
    }
}