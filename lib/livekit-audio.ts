export const PODCAST_MIC_CAPTURE_OPTIONS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  voiceIsolation: false,
  channelCount: 1,
  latency: 0,
}

export const PODCAST_ROOM_AUDIO_CAPTURE_DEFAULTS = {
  echoCancellation: PODCAST_MIC_CAPTURE_OPTIONS.echoCancellation,
  noiseSuppression: PODCAST_MIC_CAPTURE_OPTIONS.noiseSuppression,
  autoGainControl: PODCAST_MIC_CAPTURE_OPTIONS.autoGainControl,
  voiceIsolation: PODCAST_MIC_CAPTURE_OPTIONS.voiceIsolation,
  channelCount: PODCAST_MIC_CAPTURE_OPTIONS.channelCount,
  latency: PODCAST_MIC_CAPTURE_OPTIONS.latency,
}

export const BACKGROUND_MUSIC_DEFAULT_VOLUME = 0.4
export const BACKGROUND_MUSIC_VOLUME_STEP = 0.05
