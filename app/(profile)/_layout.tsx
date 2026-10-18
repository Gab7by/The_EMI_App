import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const ProfileLayout = () => {
    const profile = useAuthStore(state => state.profile)
    const authStatus = useAuthStore(state => state.authStatus)
    const isAdmin = profile?.role === "admin"
    // Only signed-in users can access profile screens
    const canAccess = authStatus === 'signed-in'

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={canAccess}>
                <Stack.Screen name="entry" />
                <Stack.Screen name="account" />
                {/* Guarded here too, not just by hiding the menu entry - so
                    deep-linking or manually typing the route can't let a
                    non-admin reach the slider image manager. */}
                <Stack.Protected guard={!!isAdmin}>
                    <Stack.Screen name="slider-images" />
                </Stack.Protected>
            </Stack.Protected>
        </Stack>
    )
}

export default ProfileLayout
