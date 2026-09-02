import { useRecordingDownload } from '@/hooks/useRecordingDownload'
import { hapticLight, hapticMedium } from '@/lib/haptics'
import { Recording } from '@/types/podcast-types'
import { Check, Download } from 'lucide-react-native'
import { Alert, Platform, Pressable, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const RING_SIZE = 26
const RING_STROKE = 2.5
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/**
 * A single control that carries a recording through its whole download
 * lifecycle: tap to start, a live progress ring while downloading, a
 * checkmark once saved - tapping that opens the "what do you want to do
 * with it" choice (share out to Files/another app, or remove it).
 */
export default function DownloadButton({ recording }: { recording: Recording }) {
    const { status, progress, download, remove, share, saveToDeviceStorage } = useRecordingDownload(recording)

    const handlePress = () => {
        if (status === 'none' || status === 'error') {
            hapticLight()
            download()
            return
        }

        if (status === 'downloaded') {
            hapticMedium()

            // iOS's share sheet has a built-in "Save to Files" action for a
            // document-type file, so Share alone covers "save this." Android
            // has no such action in a share intent - it's genuinely only
            // "send this to another app" - so it gets a real, separate save
            // action that writes into a folder the user picks (e.g. Downloads).
            const options: { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }[] = Platform.select({
                ios: [
                    {
                        text: 'Share / Save to Files',
                        onPress: () => {
                            share().catch((error) => {
                                console.error('[DownloadButton] Share failed', error)
                            })
                        },
                    },
                ],
                default: [
                    {
                        text: 'Save to device storage',
                        onPress: () => {
                            saveToDeviceStorage().catch((error) => {
                                console.error('[DownloadButton] Save to device storage failed', error)
                            })
                        },
                    },
                    {
                        text: 'Share',
                        onPress: () => {
                            share().catch((error) => {
                                console.error('[DownloadButton] Share failed', error)
                            })
                        },
                    },
                ],
            })!

            Alert.alert(
                'Downloaded',
                'This recording is saved on your device and will keep playing offline.',
                [
                    ...options,
                    { text: 'Remove download', style: 'destructive', onPress: () => remove() },
                    { text: 'Cancel', style: 'cancel' },
                ]
            )
        }
        // 'downloading' / 'checking' - let it finish, no action on tap.
    }

    return (
        <Pressable
            onPress={handlePress}
            disabled={status === 'checking' || status === 'downloading'}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            hitSlop={12}
            accessibilityLabel={status === 'downloaded' ? 'Manage downloaded recording' : 'Download recording'}
        >
            {status === 'downloading' ? (
                <View style={{ height: RING_SIZE, width: RING_SIZE }}>
                    <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                        <Circle
                            cx={RING_SIZE / 2}
                            cy={RING_SIZE / 2}
                            r={RING_RADIUS}
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth={RING_STROKE}
                            fill="none"
                        />
                        <Circle
                            cx={RING_SIZE / 2}
                            cy={RING_SIZE / 2}
                            r={RING_RADIUS}
                            stroke="#D7FF00"
                            strokeWidth={RING_STROKE}
                            fill="none"
                            strokeDasharray={RING_CIRCUMFERENCE}
                            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                            strokeLinecap="round"
                        />
                    </Svg>
                </View>
            ) : status === 'downloaded' ? (
                <Check size={18} color="#D7FF00" />
            ) : (
                <Download size={18} color={status === 'error' ? '#FF8A7A' : '#F4F5F0'} />
            )}
        </Pressable>
    )
}
