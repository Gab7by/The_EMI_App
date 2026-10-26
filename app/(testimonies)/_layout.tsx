import { useAuthStore } from "@/store/authStore"
import { Stack } from "expo-router"

const TestimoniesLayout = () => {
    const authStatus = useAuthStore(state => state.authStatus)
    const isSignedIn = authStatus === 'signed-in'

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="testimonies" />
            <Stack.Screen name="[id]" />
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name="add" />
            </Stack.Protected>
        </Stack>
    )
}

export default TestimoniesLayout