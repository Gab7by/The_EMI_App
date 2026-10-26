import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const TeachingLayout = () => {
    const profile = useAuthStore(state => state.profile)
    const authStatus = useAuthStore(state => state.authStatus)
    const isAdmin = profile?.role === "admin"
    // Guests and signed-in users can view featured teaching
    const canView = authStatus === 'signed-in' || authStatus === 'guest'

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={canView}>
                <Stack.Screen name="featured-teaching" />
            </Stack.Protected>
            {/* Guarded here too, not just by hiding the edit button - so
                deep-linking or manually typing the route can't let a
                non-admin reach the editor. */}
            <Stack.Protected guard={!!isAdmin}>
                <Stack.Screen name="edit-featured-teaching" />
            </Stack.Protected>
        </Stack>
    )
}

export default TeachingLayout
