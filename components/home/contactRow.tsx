import { Colors } from "@/constants/theme"
import { hapticLight } from "@/lib/haptics"
import { ExternalLink, type LucideIcon } from "lucide-react-native"
import { memo, useCallback } from "react"
import { Linking, Pressable, Text, View } from "react-native"

type ContactRowProps = {
  icon: LucideIcon
  label: string
  value: string
  url: string
}

const ContactRow = ({ icon: RowIcon, label, value, url }: ContactRowProps) => {
  const handlePress = useCallback(async () => {
    hapticLight()
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error("ContactRow: failed to open", url, error)
    }
  }, [url])

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 active:bg-white/10"
    >
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <RowIcon size={17} color={Colors.menorah.primary} strokeWidth={1.8} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] text-menorah-muted">{label}</Text>
        <Text className="mt-0.5 text-[14px] font-semibold text-white">{value}</Text>
      </View>
      <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <ExternalLink size={15} color="#EAEAEA" />
      </View>
    </Pressable>
  )
}

export default memo(ContactRow)
