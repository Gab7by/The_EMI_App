import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const PodcastLayout = () => {

    const profile = useAuthStore(state => state.profile)
    const authStatus = useAuthStore(state => state.authStatus)
    const isAdmin = profile?.role === "admin"
    // Only signed-in users can access live podcast screens
    const isSignedIn = authStatus === 'signed-in'

    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Protected guard={isSignedIn && isAdmin}>
                <Stack.Screen
                    name="live-podcast-admin"
                />
            </Stack.Protected>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen
                    name="live-podcast-member"
                />
            </Stack.Protected>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen
                    name="join"
                />
            </Stack.Protected>
        </Stack>
    )
}

export default PodcastLayout