const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins")

const BACKGROUND_ACTIONS_SERVICE = "com.asterinet.react.bgactions.RNBackgroundActionsTask"
const LEGACY_SUPERSAMI_SERVICES = [
  "com.supersami.foregroundservice.ForegroundService",
  "com.supersami.foregroundservice.ForegroundServiceTask",
]

const permissions = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.WAKE_LOCK",
  "android.permission.BLUETOOTH_CONNECT",
  "android.permission.POST_NOTIFICATIONS",
]

const ensurePermission = (androidManifest, permission) => {
  AndroidConfig.Permissions.ensurePermission(androidManifest, permission)
}

const upsertService = (application, service) => {
  application.service = application.service ?? []

  const existing = application.service.find(
    (entry) => entry.$?.["android:name"] === service.$["android:name"]
  )

  if (existing) {
    existing.$ = {
      ...existing.$,
      ...service.$,
    }
    return
  }

  application.service.push(service)
}

const removeServices = (application, serviceNames) => {
  application.service = (application.service ?? []).filter(
    (entry) => !serviceNames.includes(entry.$?.["android:name"])
  )
}

module.exports = function withForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)

    permissions.forEach((permission) => ensurePermission(config.modResults, permission))
    removeServices(application, LEGACY_SUPERSAMI_SERVICES)

    upsertService(application, {
      $: {
        "android:name": BACKGROUND_ACTIONS_SERVICE,
        "android:exported": "false",
        "android:foregroundServiceType": "microphone|mediaPlayback",
        "android:stopWithTask": "false",
        "tools:replace": "android:foregroundServiceType",
      },
    })

    return config
  })
}
