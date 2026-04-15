import { Colors } from "@/constants/theme"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui/button"
import { Text as ShadText } from "@/components/ui/text"
import Divider from "@/components/login/divider"
import GoogleLoginSvg from "@/assets/svgs/google-login.svg"
import AppleLoginSvg from "@/assets/svgs/apple-login.svg"
import { useRouter } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { LoginFormType } from "@/types/auth-types"
import {zodResolver} from "@hookform/resolvers/zod"
import { LoginSchema } from "@/schemas/auth-schemas"
import { useAuthStore } from "@/store/authStore"

const LoginScreen = () => {

    const router = useRouter()

    const login = useAuthStore(state => state.login)
    
    const goToPreviousScreen = () => {
        router.back()
    }

    const {control, reset, handleSubmit} = useForm<LoginFormType>({
        mode: "onSubmit",
        defaultValues: {
            "email": "",
            "password": ""
        },
        resolver: zodResolver(LoginSchema)
    })
    
    const loginUser = () => {
        login()
        reset()
    }

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg p-8 gap-8">
            <View className="flex-row gap-2 items-center">
                <Pressable onPress={goToPreviousScreen}>
                    <MaterialIcons size={24} name="arrow-back" style={{color: Colors.menorah.primary}} />
                </Pressable>
                <Text className="color-menorah-primary text-2xl font-bold">Login</Text>
            </View>
            <View className="gap-4">
                <Controller
                    name="email"
                    control={control}
                    render={
                        ({field, fieldState}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Email</Text>
                            <TextInput
                                inputMode="email"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"
                            />
                            {fieldState.error && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{fieldState.error.message}</Text>
                                </View>
                            )}
                        </View>
                        )
                    }
                />
                    
                <Controller
                    name="password"
                    control={control}
                    render={
                        ({field, fieldState}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Password</Text>
                            <TextInput
                                secureTextEntry={true}
                                inputMode="text"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"
                            />
                            {fieldState.error && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{fieldState.error.message}</Text>
                                </View>
                            )}
                        </View>
                        )
                    }
                />      
            </View>
            <Pressable>
                <Text className="text-menorah-primary">Forgot Password?</Text>
            </Pressable>
            <View className="mt-auto gap-6">
                <Button onPress={handleSubmit(() => loginUser())} className="bg-menorah-whiteSoft rounded-2xl h-16" size="lg">
                    <ShadText className="text-black font-bold">Login</ShadText>
                </Button>
                <Divider />
            </View>
            <View className="flex-row gap-5">
                <Pressable>
                    <GoogleLoginSvg />
                </Pressable>
                <Pressable>
                    <AppleLoginSvg />
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default LoginScreen