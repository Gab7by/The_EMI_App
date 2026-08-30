// Two distinct local-storage tiers, deliberately kept separate:
//
// 1. The CACHE tier (cacheDirectory) - populated silently in the background
//    the first time a recording streams, so every subsequent play is
//    instant and works offline. The OS is free to reclaim this under
//    storage pressure; if it does, playback just falls back to streaming
//    again. Nothing the user sees or manages.
//
// 2. The DOWNLOAD tier (documentDirectory) - only ever written when the
//    user explicitly taps "Download". Permanent (survives app restarts,
//    not OS-reclaimable), user-visible, user-deletable, and shareable out
//    to the OS via expo-sharing so it can be saved to Files / opened in any
//    other app. A download always doubles as an instant local copy for our
//    own player too - getLocalPlaybackUri checks this tier first.
//
// Uses the `expo-file-system/legacy` API specifically because it's the only
// one of the two file-system APIs this Expo SDK ships that exposes download
// progress (createDownloadResumable's callback) - the modern File API's
// downloadFileAsync has no progress hook, which matters for something the
// size of a full sermon recording.
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import { Recording } from "@/types/podcast-types"
import { getRecordingSignedUrl } from "./recording"

const CACHE_DIR = `${FileSystem.cacheDirectory}sermon-cache/`
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}sermon-downloads/`

const ensureDir = async (dir: string) => {
    const info = await FileSystem.getInfoAsync(dir)
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    }
}

const getExtension = (filePath: string) => {
    const match = filePath.match(/\.([a-zA-Z0-9]+)$/)
    return match ? `.${match[1]}` : ".m4a"
}

const cachePathFor = (recording: Recording) => `${CACHE_DIR}${recording.id}${getExtension(recording.file_path)}`
const downloadPathFor = (recording: Recording) => `${DOWNLOAD_DIR}${recording.id}${getExtension(recording.file_path)}`

const fileExists = async (uri: string): Promise<boolean> => {
    try {
        const info = await FileSystem.getInfoAsync(uri)
        return info.exists
    } catch {
        return false
    }
}

/**
 * Returns a local file:// uri if this recording already has one (an
 * explicit download always wins over the transient cache), or null if it
 * still needs to be streamed from the network.
 */
export const getLocalPlaybackUri = async (recording: Recording): Promise<string | null> => {
    const downloadPath = downloadPathFor(recording)
    if (await fileExists(downloadPath)) return downloadPath

    const cachePath = cachePathFor(recording)
    if (await fileExists(cachePath)) return cachePath

    return null
}

/**
 * Fire-and-forget: silently populates the replay cache after a recording
 * starts streaming for the first time. Never throws - a failed cache write
 * must never disrupt playback that's already working.
 */
export const cacheRecordingInBackground = (recording: Recording, remoteUrl: string): void => {
    void (async () => {
        try {
            if (await fileExists(downloadPathFor(recording))) return
            if (await fileExists(cachePathFor(recording))) return
            await ensureDir(CACHE_DIR)
            await FileSystem.downloadAsync(remoteUrl, cachePathFor(recording))
        } catch (error) {
            console.warn("[recording-downloads] Background cache failed", error)
        }
    })()
}

export type DownloadProgress = { bytesWritten: number; bytesTotal: number }

export const isRecordingDownloaded = (recording: Recording): Promise<boolean> =>
    fileExists(downloadPathFor(recording))

/** Explicitly downloads a recording to the permanent tier, reporting progress. */
export const downloadRecording = async (
    recording: Recording,
    onProgress?: (progress: DownloadProgress) => void
): Promise<string> => {
    const signedUrl = await getRecordingSignedUrl(recording.file_path)
    if (!signedUrl) throw new Error("Could not get a download link for this recording.")

    await ensureDir(DOWNLOAD_DIR)
    const destination = downloadPathFor(recording)

    const resumable = FileSystem.createDownloadResumable(
        signedUrl,
        destination,
        {},
        (data) => {
            if (data.totalBytesExpectedToWrite > 0) {
                onProgress?.({
                    bytesWritten: data.totalBytesWritten,
                    bytesTotal: data.totalBytesExpectedToWrite,
                })
            }
        }
    )

    const result = await resumable.downloadAsync()
    if (!result) throw new Error("Download did not complete.")
    return result.uri
}

export const deleteDownloadedRecording = async (recording: Recording): Promise<void> => {
    const path = downloadPathFor(recording)
    if (await fileExists(path)) {
        await FileSystem.deleteAsync(path, { idempotent: true })
    }
}

/** Hands the local file to the OS share sheet - "Save to Files", AirDrop, or open with any other app that accepts audio. */
export const shareDownloadedRecording = async (recording: Recording): Promise<void> => {
    const path = downloadPathFor(recording)
    if (!(await fileExists(path))) {
        throw new Error("This recording has not been downloaded yet.")
    }
    if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this device.")
    }
    await Sharing.shareAsync(path)
}
