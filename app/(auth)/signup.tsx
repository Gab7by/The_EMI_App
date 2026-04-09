import { Colors } from "@/constants/theme"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui/button"
import { Text as ShadText } from "@/components/ui/text"
import { useRouter } from "expo-router"
import { Controller, useForm } from "react-hook-form"
import { SignUpFormType } from "@/types/auth-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignUpSchema } from "@/schemas/auth-schemas"

const SignUpScreen = () => {

    const router = useRouter()

    const routeToLogin = () => {
        router.replace("/(auth)/login")
    }

    const goToPreviousScreen = () => {
        router.back()
    }

    const {reset, handleSubmit, control} = useForm<SignUpFormType>({
        defaultValues: {
            "fullName": "",
            "email": "",
            "password": "",
            "confirmPassword": ""
        },
        mode: "onSubmit",
        resolver: zodResolver(SignUpSchema)
    })

    const signUpUser = () => {
        console.log("Sign up successful")
        reset()
    }

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg p-8 gap-8">
            <View className="flex-row gap-2 items-center">
                <Pressable onPress={goToPreviousScreen}>
                    <MaterialIcons size={24} name="arrow-back" style={{color: Colors.menorah.primary}} />
                </Pressable>
                <Text className="color-menorah-primary text-2xl font-bold">Sign Up</Text>
            </View>
            <View className="gap-4">
                <Controller
                    name="fullName"
                    control={control}
                    render={({fieldState, field}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Full Name</Text>
                            <TextInput
                                inputMode="text"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}       
                                placeholder="Enter your full name"
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
                    )}
                />
                <Controller
                    name="email"
                    control={control}
                    render={({fieldState, field}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Email</Text>
                            <TextInput
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}       
                                inputMode="email"       
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
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({fieldState, field}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Password</Text>
                            <TextInput
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}       
                                inputMode="text"       
                                secureTextEntry={true}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"                            />
                            {fieldState.error && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{fieldState.error.message}</Text>
                                </View>
                            )}
                        </View>
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({fieldState, field}) => (
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Confirm Password</Text>
                            <TextInput
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}       
                                inputMode="text"       
                                secureTextEntry={true}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"                            />
                            {fieldState.error && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{fieldState.error.message}</Text>
                                </View>
                            )}
                        </View>
                    )}
                />
            </View>
            <Text className="text-menorah-primary/30 text-xs">
                By creating this account, you agree to our Terms of Service and Privacy Policy
            </Text>
            <Button onPress={handleSubmit(() => signUpUser())} className="bg-menorah-primary rounded-2xl h-16" size="lg">
                <ShadText className="text-black font-bold">Create Account</ShadText>
            </Button>
            <View className="flex-row mt-auto self-center gap-1">
                <Text className="text-menorah-primary/30">Already have an account?</Text>
                <Pressable  onPress={routeToLogin}>
                    <Text className="text-menorah-primary">Login</Text>
                </Pressable>  
            </View>
        </SafeAreaView>
    )
}

export default SignUpScreen