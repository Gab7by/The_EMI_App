import { Icon } from "@/components/ui/icon"
import { Colors } from "@/constants/theme"
import { supabase } from "@/lib/supabase"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Loader2 } from "lucide-react-native"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ForgotPasswordScreen = () => {
    const router = useRouter()

    const {email} = useLocalSearchParams<{email: string}>()

    const [resetToken, setResetToken] = useState<string>("")
    const [resetTokenInputError, setResetTokenInputError] = useState<string | null>(null)
    
    const [newPassword, setNewPassword] = useState<string>("")
    const [newPasswordInputError, setNewPasswordInputError] = useState<string | null>(null)

    const [errorResetingPassword, setErrorResetingPassword] = useState<string | null>(null)

    const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false)
    const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false)

    const resetPassword = async () => {
        if (resetToken.length != 8) {
            setResetTokenInputError("Reset Token should be 8 digits")
            setTimeout(() => {
                setResetTokenInputError(null)
            }, 2000)
            return
        }
        if (newPassword.length < 8) {
            setNewPasswordInputError("New Password must be atleast 8 characters")
            setTimeout(() => {
                setNewPasswordInputError(null)
            }, 2000)
            return
        }

        try {
            setIsVerifyingToken(true)
            const {error} = await supabase.auth.verifyOtp({
                type: "recovery",
                token: resetToken,
                email: email
            })
            if (error) {
                setIsVerifyingToken(false)
                setErrorResetingPassword(error.message)
                setTimeout(() => {
                    setErrorResetingPassword(null)
                }, 3000)
                return
            }

            setIsVerifyingToken(false)
            setIsChangingPassword(true)
            const {error: passwordError} = await supabase.auth.updateUser(
                {
                    password: newPassword
                }
            )

            if (passwordError) {
                setIsChangingPassword(false)
                setErrorResetingPassword(passwordError.message)
                setTimeout(() => {
                    setErrorResetingPassword (null)
                }, 3000)
                return
            }

            setIsChangingPassword(false)
        } catch(e) {
            setErrorResetingPassword("Something went wrong")
            setTimeout(() => {
                setErrorResetingPassword(null)
            }, 3000);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-8">
                    <View className="flex-row gap-2 items-center">
                        <Pressable onPress={() => router.back()}>
                            <MaterialIcons size={24} name="arrow-back" style={{color: Colors.menorah.primary}} />
                        </Pressable>
                        <Text className="color-menorah-primary text-xl font-bold">Password Reset</Text>
                    </View>
                    <View className="gap-2">
                        <Text className="text-menorah-primary">An email has been sent {email}</Text>
                        <Text className="text-white">Please enter your 6 digit reset token and set new Password</Text>
                    </View>
                    {errorResetingPassword && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{errorResetingPassword}</Text>
                                </View>
                            )}
                    <View className="gap-5">
                        <View className="gap-2">
                            <Text className="text-menorah-primary">Reset Token</Text>
                            <TextInput
                                inputMode="numeric"
                                maxLength={8}
                                value={resetToken}
                                onChangeText={(text) => setResetToken(text)}
                                placeholder="Enter the reset token"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"
                            />
                            {resetTokenInputError && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{resetTokenInputError}</Text>
                                </View>
                            )}
                        </View>
                        <View className="gap-2">
                            <Text className="text-menorah-primary">New Password</Text>
                            <TextInput
                                inputMode="text"
                                secureTextEntry={true}
                                value={newPassword}
                                onChangeText={(text) => setNewPassword(text)}
                                placeholder="Enter new Password"
                                placeholderTextColor={Colors.menorah.muted}
                                className="p-4 border border-menorah-inputBorder rounded-2xl text-menorah-whiteSoft"
                            />
                            {newPasswordInputError && (
                                <View className="flex-row gap-2 items-center">
                                    <MaterialIcons name="warning" color={Colors.menorah.error} />
                                    <Text className="text-menorah-error">{newPasswordInputError}</Text>
                                </View>
                            )}
                        </View>
                        <Pressable onPress={resetPassword} className="bg-menorah-primary rounded-full flex-row px-8 py-6 justify-center">
                             {
                                isVerifyingToken || isChangingPassword ? 
                                    (
                                        <View className="flex-row gap-2 items-center justify-center">
                                            <View className="pointer-events-none animate-spin">
                                                <Icon as={Loader2} className="text-black" />
                                            </View>
                                            <Text className="text-black">{isVerifyingToken ? "Verifying Token" : "Changing Password"}</Text>
                                        </View>
                                    ):
                                    <Text className="text-menorah-bg font-bold text-base">Change Password</Text>
                             }
                        </Pressable>
                    </View>
        </SafeAreaView>
    )
}

export default ForgotPasswordScreen