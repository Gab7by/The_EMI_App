import { Colors } from "@/constants/theme"
import { supabase } from "@/lib/supabase"
import { LivePodcast } from "@/types/podcast-types"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const JoinScreen = () => {

    const {id} = useLocalSearchParams<{id: string}>()

    const [error, setError] = useState<string | null>(null)

    const router = useRouter()

    useEffect(() => {
        if (!id) {
            setError("Invalid podcast link. No podcast ID provided.")
            return
        }

        const fetchAndJoinPodcast = async () => {
            const {data, error: fetchError} = await supabase
                .from('live_podcasts')
                .select(
                    `*,
                    host:profiles!host_id(*)
                    `
                )
                .eq('id', id)
                .single()
            
            if (fetchError || !data) {
                console.error("Error fetching podcast:", fetchError)
                setError("Failed to find the podcast. It may have ended or the link is invalid.")
                return
            }

            const session = data as LivePodcast

            if (session.status !== "live") {
                setError("This podcast is not currently live. It may have ended or the link is invalid.")
                return
            }

            router.replace({
                pathname: "/(podcast)/live-podcast-member",
                params: {
                    id,
                    title: session.title,
                    playlist: session.playlist,
                    hostId: session.host.id,
                    hostName: session.host.full_name,
                    hostPictureUrl: session.host.avatar_url,
                    livekitRoomName: session.livekit_room_name,
                    coverImageUrl: session.cover_image_url
                }         
        })
    }

    fetchAndJoinPodcast()

    }, [id])
    
    return (
        <SafeAreaView className="flex-1 bg-menorah-bg p-8 gap-8">
            {
                error ? (
                    <>
                        <Text className="text-menorah-primary text-xl font-semibold text-center">{error}</Text>
                        <Pressable className="bg-menorah-primary rounded-lg px-4 py-2 self-center" onPress={() => router.replace('/(tabs)/podcast')}>
                            <Text className="text-menorah-bg">Go to sessions</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <ActivityIndicator
                            size="large"
                            color={Colors.menorah.primary}
                        />
                        <Text className="text-menorah-primary text-xl font-semibold text-center">Joining Podcast...</Text>
                    </>
                )
            }
        </SafeAreaView>
    )
}

export default JoinScreen