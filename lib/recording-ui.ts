// Shared visual constants for the recording/library UI - was previously
// duplicated verbatim between RecordingItem and RecordingPlayerScreen.
const PLAYLIST_COLORS: Record<string, string> = {
    'Lunch Prayer Fire': '#FF6B35',
    'Priesthood Time': '#4D96FF',
    'School of the Prophets': '#9B51E0',
    'School of Spiritual Mysteries': '#00C9A6',
    'Mega One Word From the Lord': '#FFD700',
    '45 minutes in Tongues': '#FF4B5F',
    'Prophetic Training': '#8A2BE2',
    'Prophetic Prayers': '#32CD32',
    'Prophetic Crossover Service': '#FF8C00',
}

export const DEFAULT_PLAYLIST_COLOR = '#D7FF00'

export const getPlaylistColor = (playlist?: string | null): string =>
    (playlist && PLAYLIST_COLORS[playlist]) || DEFAULT_PLAYLIST_COLOR
