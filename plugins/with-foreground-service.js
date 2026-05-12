const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins")

const FOREGROUND_SERVICE = "com.supersami.foregroundservice.ForegroundService"
const FOREGROUND_SERVICE_TASK = "com.supersami.foregroundservice.ForegroundServiceTask"

const permissions = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.WAKE_LOCK",
]

const ensurePermission = (manifest, permission) => {
  AndroidConfig.Permissions.addPermission(manifest, permission)
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

module.exports = function withForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)

    permissions.forEach((permission) => ensurePermission(manifest, permission))

    upsertService(application, {
      $: {
        "android:name": FOREGROUND_SERVICE,
        "android:exported": "false",
        "android:foregroundServiceType": "microphone|mediaPlayback",
        "android:stopWithTask": "false",
      },
    })

    upsertService(application, {
      $: {
        "android:name": FOREGROUND_SERVICE_TASK,
        "android:exported": "false",
        "android:stopWithTask": "false",
      },
    })

    return config
  })
}
