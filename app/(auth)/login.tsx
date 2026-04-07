import { Colors } from "@/constants/theme"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Button, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const LoginScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-menorah-bg p-8 gap-8">
            <View className="flex-row gap-2 items-center">
                <MaterialIcons size={24} name="arrow-back" style={{color: Colors.menorah.primary}} />
                <Text className="color-menorah-primary text-2xl font-bold">Login</Text>
            </View>
            <View className="gap-4">
                <View className="gap-2">
                    <Text className="text-xl text-menorah-primary">Email</Text>
                    <TextInput
                        inputMode="email"       
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.menorah.muted}
                        className="p-4 border border-menorah-inputBorder rounded-2xl"
                    />
                </View>
                <View className="gap-2">
                    <Text className="text-xl text-menorah-primary">Password</Text>
                    <TextInput
                        secureTextEntry={true}
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.menorah.muted}
                        className="p-4 border border-menorah-inputBorder rounded-2xl"
                    />
                </View>
            </View>
            <Text className="text-menorah-primary font-bold">Forgot password?</Text>
        </SafeAreaView>
    )
}

export default LoginScreen