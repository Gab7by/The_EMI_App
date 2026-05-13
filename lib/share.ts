import * as Linking from "expo-linking"
import { Share } from "react-native"

export const shareLivePodcast = async (params: {
    podcastId: string,
    title: string,
    hostName: string,
    playlist: string
}) => {

    const deepLink = Linking.createURL(
        '(podcast)/join', {
            queryParams: {
                id: params.podcastId
            }
        }
    )

    try {
        await Share.share({
            message: `Join me in listening to ${params.title} by ${params.hostName} on The Menorah! Click the link to join the live podcast: ${deepLink}`,
            title: `Join ${params.title} on The Menorah!`
        })
    } catch (error) {
        console.error("Error sharing:", error)
    }
}