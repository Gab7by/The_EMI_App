import { useEffect } from "react"
import { Platform } from "react-native"
import {
    ForegroundServiceType,
    startForegroundService,
    stopForegroundService
} from "@/lib/foreground-service"

export const useForegroundService = (
    isActive: boolean,
    serviceType: ForegroundServiceType = "mediaPlayback"
) => {
    useEffect(() => {
        if (Platform.OS != "android") return

        if (isActive) {
            startService(serviceType)
        } else {
            stopService()
        }

        return () => {
            stopService()
        }
    }, [isActive, serviceType])
}

const startService = async (serviceType: ForegroundServiceType) => {

    try {
        await startForegroundService({
            id: 1001,
            title: "The Menorah - Live",
            message: "Session is active",
            ServiceType: serviceType,
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

const stopService = async () => {
    try {
        await stopForegroundService()
    } catch(error) {
        console.error("Error stopping foreground service:", error)
    }
}
