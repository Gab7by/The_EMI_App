import ForgotPasswordModal from "@/components/auth/forgot-password-modal"
import { Stack } from "expo-router"

const AuthRootLayout = () => {

    return (
        <>
            <Stack screenOptions={{
                headerShown: false
            }}>
                <Stack.Screen
                    name="welcome"
                />
                <Stack.Screen
                    name="signup"
                />
                <Stack.Screen
                    name="login"
                />
                <Stack.Screen 
                    name="forgot-password"
                />
            </Stack>
            <ForgotPasswordModal />
        </>
    )
}

export default AuthRootLayout