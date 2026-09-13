import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const TeachingLayout = () => {
    const profile = useAuthStore(state => state.profile)
    const isAdmin = profile?.role === "admin"

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="featured-teaching" />
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
