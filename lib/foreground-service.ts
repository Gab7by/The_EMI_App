import { AppRegistry, DeviceEventEmitter, NativeModules, Platform } from "react-native"

export type ForegroundServiceType = "mediaPlayback" | "microphone" | "phoneCall" | "location"

type ForegroundServiceConfig = {
  id: number
  title: string
  message: string
  ServiceType: ForegroundServiceType
  visibility?: "private" | "public" | "secret"
  icon?: string
  largeIcon?: string
  importance?: "none" | "min" | "low" | "default" | "high" | "max"
  number?: string
  button?: boolean
}

type RegisterConfig = {
  config?: {
    alert?: boolean
    onServiceErrorCallBack?: () => void
  }
}

const ForegroundServiceModule = NativeModules.ForegroundService
const taskName = "myTaskName"
let isRegistered = false
let serviceRunning = false
let activeServiceType: ForegroundServiceType | null = null

const taskRunner = async () => {}

const ensureAndroidModule = () => {
  if (Platform.OS !== "android") return null
  return ForegroundServiceModule
}

export const registerForegroundService = ({ config }: RegisterConfig = {}) => {
  const module = ensureAndroidModule()
  if (!module || isRegistered) return

  DeviceEventEmitter.addListener("onServiceError", () => {
    config?.onServiceErrorCallBack?.()
  })

  AppRegistry.registerHeadlessTask(taskName, () => taskRunner)
  isRegistered = true
}

export const startForegroundService = async (config: ForegroundServiceConfig) => {
  const module = ensureAndroidModule()
  if (!module) return
  if (serviceRunning && activeServiceType === config.ServiceType) return

  if (serviceRunning) {
    await stopForegroundService()
  }

  try {
    await module.startService({
      vibration: false,
      largeIcon: "ic_launcher",
      ...config,
    })

    serviceRunning = true
    activeServiceType = config.ServiceType

    await module.runTask({
      taskName,
      delay: 500,
      loopDelay: 500,
      onLoop: true,
    })
  } catch (error) {
    serviceRunning = false
    activeServiceType = null
    throw error
  }
}

export const stopForegroundService = async () => {
  const module = ensureAndroidModule()
  if (!module || !serviceRunning) return

  serviceRunning = false
  activeServiceType = null
  await module.stopService()
}
