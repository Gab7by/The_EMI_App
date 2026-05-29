import { PermissionsAndroid, Platform } from "react-native"

export type ForegroundServiceType = "mediaPlayback" | "microphone"

type BackgroundServiceModule = typeof import("react-native-background-actions").default

type KeepAliveTaskArgs = {
  delay: number
}

let backgroundServicePromise: Promise<BackgroundServiceModule> | null = null
let activeServiceType: ForegroundServiceType | null = null
let serviceOperation: Promise<void> = Promise.resolve()

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

const getBackgroundService = () => {
  backgroundServicePromise ??= import("react-native-background-actions").then(
    (module) => module.default
  )

  return backgroundServicePromise
}

const keepAliveTask = async (taskData?: KeepAliveTaskArgs) => {
  const delay = taskData?.delay ?? 1000
  const BackgroundService = await getBackgroundService()

  while (BackgroundService.isRunning()) {
    await sleep(delay)
  }
}

const ensureNotificationPermission = async () => {
  if (Platform.OS !== "android" || Platform.Version < 33) return

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  const hasPermission = await PermissionsAndroid.check(permission)
  if (hasPermission) return

  await PermissionsAndroid.request(permission)
}

const getForegroundServiceTypes = (serviceType: ForegroundServiceType) => {
  if (serviceType === "microphone") {
    return ["microphone", "mediaPlayback"] as const
  }

  return ["mediaPlayback"] as const
}

const runServiceOperation = (operation: () => Promise<void>) => {
  serviceOperation = serviceOperation.then(operation, operation)
  return serviceOperation
}

const startForegroundServiceNow = async (serviceType: ForegroundServiceType) => {
  const BackgroundService = await getBackgroundService()

  await ensureNotificationPermission()

  if (BackgroundService.isRunning()) {
    if (activeServiceType === serviceType) {
      await BackgroundService.updateNotification({
        taskTitle: "The Menorah - Live",
        taskDesc: serviceType === "microphone" ? "Live audio session is active" : "Live session is active",
      })
      return
    }

    await BackgroundService.stop()
    activeServiceType = null
  }

  await BackgroundService.start(keepAliveTask, {
    taskName: "The Menorah Live",
    taskTitle: "The Menorah - Live",
    taskDesc: serviceType === "microphone" ? "Live audio session is active" : "Live session is active",
    taskIcon: {
      name: "ic_launcher",
      type: "mipmap",
    },
    color: "#D7FF00",
    linkingURI: "themenorah://",
    foregroundServiceType: [...getForegroundServiceTypes(serviceType)],
    parameters: {
      delay: 1000,
    },
  })

  activeServiceType = serviceType
}

export const startLiveForegroundService = async (serviceType: ForegroundServiceType) => {
  if (Platform.OS !== "android") return

  await runServiceOperation(() => startForegroundServiceNow(serviceType))
}

export const stopForegroundService = async () => {
  if (Platform.OS !== "android" || !backgroundServicePromise || !activeServiceType) return

  await runServiceOperation(async () => {
    const BackgroundService = await getBackgroundService()

    if (BackgroundService.isRunning()) {
      await BackgroundService.stop()
    }

    activeServiceType = null
  })
}
