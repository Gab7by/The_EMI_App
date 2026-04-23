import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const PodcastLayout = () => {

    const profile = useAuthStore(state => state.profile)
    const isAdmin = profile?.role === "admin"

    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Protected guard={!!isAdmin}>
                <Stack.Screen
                    name="live-podcast-admin"
                />
            </Stack.Protected>
            <Stack.Protected guard={!isAdmin}>
                <Stack.Screen
                    name="live-podcast-member"
                />
            </Stack.Protected>
        </Stack>
    )
}

export default PodcastLayout