import { useEffect } from "react"
import { Platform } from "react-native"
import ReactNativeForegroundService from "@supersami/rn-foreground-service"

export const useForegroundService = (isActive: boolean) => {
    useEffect(() => {
        if (Platform.OS != "android") return

        if (isActive) {
            startService()
        } else {
            stopService()
        }

        return () => {
            stopService()
        }
    }, [isActive])
}

const startService = async () => {

    try {
        ReactNativeForegroundService.start({
            id: 1001,
            title: "The Menorah - Live",
            message: "Session is active",
            visibility: "public",
            icon: 'ic_launcher',
            importance: "low",
            number: '0',
            button: false
        }) 
        } catch(error) {
            console.error("Error starting foreground service:", error)
    }
}

const stopService = () => {
    try {
        ReactNativeForegroundService.stop()
    } catch(error) {
        console.error("Error stopping foreground service:", error)
    }
}