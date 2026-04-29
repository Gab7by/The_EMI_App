import { Colors } from "@/constants/theme"
import { supabase } from "@/lib/supabase"
import { useForgotPasswordModalStore } from "@/store/authStore"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { Icon } from "../ui/icon"
import { Loader2 } from "lucide-react-native"

const ForgotPasswordModal = () => {

    const router = useRouter()

    const isModalOpen = useForgotPasswordModalStore(state => state.isOpen)
    const setModalOpen = useForgotPasswordModalStore(state => state.setIsOpen)
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false)
    const [errorSendingEmail, setErrorSendingEmail] = useState<string | null>(null)

    const [email, setEmail] = useState<string>("")

    const closeModal = () => {
        setEmail("")
        setModalOpen(false)
    }

    const sendEmail = async () => {
        try{
            setIsSendingEmail(true)
            if(email.length < 5 || !email.endsWith(".com")) {
                setErrorSendingEmail("Enter a valid email")
                setTimeout(() => {
                    setErrorSendingEmail(null)
                }, 2000)

                return
            } 

            const {error} = await supabase.auth.resetPasswordForEmail(email)
            if (error) {
                setErrorSendingEmail(error.message)
                setTimeout(() => {
                    setErrorSendingEmail(null)
                }, 2000)
                return
            }

            closeModal()
            setTimeout(() => {
                router.push(
                    {
                        pathname: "/(auth)/forgot-password",
                        params: {
                            email
                        }
                    }
                )
            }, 100)

        } catch(e) {
            setErrorSendingEmail("Something went wrong, Try again")
                setTimeout(() => {
                    setErrorSendingEmail(null)
                }, 2000)
        } finally {
            setIsSendingEmail(false)
            setEmail("")
        }
    }

    return (
        <Modal
            visible={isModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => closeModal()}
            style={{backgroundColor: "transparent", flex: 1}}
        >
            <BlurView
                intensity={20}
                tint="dark"
                style={{ flex:  1}}
                onTouchEnd={() => closeModal()}
            />

            <View
                className="bg-menorah-darkGreen"
                style={{flex: 1}}
            >
                <ScrollView
                    contentContainerClassName="px-5 gap-7"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    >
                    <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                    <View className="flex-1 gap-7">
                        <Text className="text-menorah-primary text-base">A reset token will be sent your email if email is found.</Text>
                        <View className="border border-menorah-primary p-5 rounded-2xl gap-1">
                            <Text className="text-menorah-primary text-base">Enter your email</Text>
                            <TextInput
                                inputMode="email"
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                placeholder="enter a valid email"
                                placeholderTextColor={`${Colors.menorah.primary}40`}
                                className="text-menorah-whiteSoft text-base"
                            />
                            {errorSendingEmail && (
                                    <View className="flex-row gap-2 items-center">
                                        <MaterialIcons name="warning" color={Colors.menorah.error} />
                                        <Text className="text-menorah-error">{errorSendingEmail}</Text>
                                    </View>
                                )}
                        </View>
                        <Pressable onPress={sendEmail}  className="bg-menorah-primary rounded-full flex-row px-8 py-6 justify-center">
                                {isSendingEmail ?
                                <View className="pointer-events-none animate-spin">
                                    <Icon as={Loader2} color={Colors.menorah.bg} />
                                </View> :
                                 <Text className="text-menorah-bg font-bold text-base">Request token</Text>}
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    )
}

export default ForgotPasswordModal