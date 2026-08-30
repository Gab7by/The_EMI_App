import {
    deleteDownloadedRecording,
    downloadRecording,
    isRecordingDownloaded,
    shareDownloadedRecording,
    type DownloadProgress,
} from "@/lib/recording-downloads"
import { Recording } from "@/types/podcast-types"
import { useCallback, useEffect, useRef, useState } from "react"

export type RecordingDownloadStatus = "checking" | "none" | "downloading" | "downloaded" | "error"

export const useRecordingDownload = (recording: Recording) => {
    const [status, setStatus] = useState<RecordingDownloadStatus>("checking")
    const [progress, setProgress] = useState(0)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        setStatus("checking")

        isRecordingDownloaded(recording)
            .then((downloaded) => {
                if (mountedRef.current) setStatus(downloaded ? "downloaded" : "none")
            })
            .catch(() => {
                if (mountedRef.current) setStatus("none")
            })

        return () => {
            mountedRef.current = false
        }
        // Deliberately keyed on the id, not the `recording` object - callers
        // often pass a fresh object reference each render (e.g. from a list
        // .map()), which would otherwise re-run this filesystem check on
        // every render instead of only when we're actually looking at a
        // different recording.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recording.id])

    const download = useCallback(async () => {
        setStatus((current) => {
            if (current === "downloading" || current === "downloaded") return current
            return "downloading"
        })
        setProgress(0)

        try {
            await downloadRecording(recording, (p: DownloadProgress) => {
                if (!mountedRef.current) return
                setProgress(p.bytesTotal > 0 ? p.bytesWritten / p.bytesTotal : 0)
            })
            if (mountedRef.current) setStatus("downloaded")
        } catch (error) {
            console.error("[useRecordingDownload] Download failed", error)
            if (mountedRef.current) setStatus("error")
        }
    }, [recording])

    const remove = useCallback(async () => {
        await deleteDownloadedRecording(recording)
        if (mountedRef.current) setStatus("none")
    }, [recording])

    const share = useCallback(async () => {
        await shareDownloadedRecording(recording)
    }, [recording])

    return { status, progress, download, remove, share }
}
