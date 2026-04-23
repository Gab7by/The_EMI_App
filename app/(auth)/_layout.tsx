import { Stack } from "expo-router"

const AuthRootLayout = () => {

    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen
                name="index"
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
    )
}

export default AuthRootLayout