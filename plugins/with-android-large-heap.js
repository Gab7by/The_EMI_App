const { withAndroidManifest } = require("@expo/config-plugins")

// Saving a downloaded recording to a user-picked folder (Storage Access
// Framework) has to go through expo-file-system's base64 read/write API -
// there's no chunked/streamed write into a SAF content:// URI available.
// For a full sermon recording that's a single-digit-hundred-MB base64
// string held in memory at once, which blew past the default Android JS
// heap (~256MB on many devices) with an OutOfMemoryError. largeHeap raises
// that ceiling - it's the standard, documented mitigation for apps that
// occasionally need a big single in-memory buffer like this.
module.exports = function withAndroidLargeHeap(config) {
  return withAndroidManifest(config, (config) => {
    const { AndroidConfig } = require("@expo/config-plugins")
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)

    application.$["android:largeHeap"] = "true"

    return config
  })
}
