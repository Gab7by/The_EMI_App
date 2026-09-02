import { Colors } from "@/constants/theme"
import * as Clipboard from "expo-clipboard"
import { Check, Copy, type LucideIcon } from "lucide-react-native"
import { memo, useCallback, useState } from "react"
import { Pressable, Text, View } from "react-native"

type CopyFieldProps = {
    icon: LucideIcon
    label: string
    value: string
    /** Extra context shown under the value, e.g. the account holder's name. Not copied. */
    subtitle?: string
    /** What actually gets copied - defaults to `value`. */
    copyValue?: string
}

const CopyField = ({ icon: FieldIcon, label, value, subtitle, copyValue }: CopyFieldProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        await Clipboard.setStringAsync(copyValue ?? value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }, [copyValue, value])

    return (
        <View className="flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <FieldIcon size={17} color={Colors.menorah.primary} strokeWidth={1.8} />
            </View>
            <View className="flex-1 min-w-0">
                <Text className="text-[11px] text-menorah-muted">{label}</Text>
                <Text className="mt-0.5 text-[14px] font-semibold text-white" numberOfLines={1}>
                    {value}
                </Text>
                {subtitle ? (
                    <Text className="mt-0.5 text-[11px] text-menorah-muted" numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            <Pressable
                onPress={handleCopy}
                hitSlop={10}
                className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
                {copied ? (
                    <Check size={16} color={Colors.menorah.primary} />
                ) : (
                    <Copy size={16} color="#EAEAEA" />
                )}
            </Pressable>
        </View>
    )
}

export default memo(CopyField)
