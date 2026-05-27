import { useEffect, useRef } from "react"
import { Platform } from "react-native"
import {
    ForegroundServiceType,
    startLiveForegroundService,
    stopForegroundService
} from "@/lib/foreground-service"

export const useForegroundService = (
    isActive: boolean,
    serviceType: ForegroundServiceType = "mediaPlayback"
) => {
    const hasStartedServiceRef = useRef(false)

    useEffect(() => {
        if (Platform.OS != "android") return

        if (isActive) {
            hasStartedServiceRef.current = true
            startService(serviceType)
        } else if (hasStartedServiceRef.current) {
            hasStartedServiceRef.current = false
            stopService()
        }
    }, [isActive, serviceType])
}

const startService = async (serviceType: ForegroundServiceType) => {

    try {
        await startLiveForegroundService(serviceType)
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
