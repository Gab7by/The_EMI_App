import { Alert, Linking } from "react-native"

export const openPaymentLink = async () => {
    try {
        await Linking.openURL(process.env.EXPO_PUBLIC_PAYSTACK_PAYMENT_URL!)
    } catch (e) {
        console.log(e)
        Alert.alert("Something went wrong", "Please try again later")
    }
}