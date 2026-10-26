import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const ProfileLayout = () => {
    const profile = useAuthStore(state => state.profile)
    const authStatus = useAuthStore(state => state.authStatus)
    const isAdmin = profile?.role === "admin"
    // Guests and signed-in users can access profile entry and account
    const canAccess = authStatus === 'signed-in' || authStatus === 'guest'
    // Admin only for slider images
    const canAccessAdmin = isAdmin

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={canAccess}>
                <Stack.Screen name="entry" />
                <Stack.Screen name="account" />
            </Stack.Protected>
            {/* Guarded here too, not just by hiding the menu entry - so
                deep-linking or manually typing the route can't let a
                non-admin reach the slider image manager. */}
            <Stack.Protected guard={canAccessAdmin}>
                <Stack.Screen name="slider-images" />
            </Stack.Protected>
        </Stack>
    )
}

export default ProfileLayout
