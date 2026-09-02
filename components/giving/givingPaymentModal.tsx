import CopyField from "@/components/giving/copyField"
import { Colors } from "@/constants/theme"
import { openPaymentLink } from "@/lib/giving"
import { ExternalLink, Landmark, Mail, Smartphone, X, type LucideIcon } from "lucide-react-native"
import { Modal, Pressable, Text, View, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type GivingPaymentModalProps = {
    visible: boolean
    onClose: () => void
    icon: LucideIcon
    iconColor: string
    title: string
    description: string
}

const GivingPaymentModal = ({
    visible,
    onClose,
    icon: TileIcon,
    iconColor,
    title,
    description,
}: GivingPaymentModalProps) => {
    const insets = useSafeAreaInsets()
    const { height } = useWindowDimensions()

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <View className="flex-1 justify-end">
                <Pressable onPress={onClose} className="absolute inset-0 bg-black/50" />

                <View
                    className="rounded-t-[28px] bg-menorah-bg px-5 pt-3"
                    style={{ maxHeight: height * 0.86, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
                >
                    <View className="mb-2 h-1 w-10 self-center rounded-full bg-white/15" />

                    <View className="flex-row items-start justify-between pt-3">
                        <View className="flex-1 flex-row items-center pr-3">
                            <View
                                className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: iconColor }}
                            >
                                <TileIcon size={21} color={Colors.menorah.bg} strokeWidth={1.8} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[18px] font-bold text-white">{title}</Text>
                                <Text className="mt-0.5 text-[12px] text-menorah-muted">{description}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            hitSlop={10}
                            className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                        >
                            <X size={17} color="#EAEAEA" />
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={openPaymentLink}
                        className="mt-6 flex-row items-center justify-center rounded-2xl bg-menorah-primary px-5 py-4 active:opacity-90"
                    >
                        <Text className="text-[15px] font-bold text-menorah-bg">Pay with Paystack</Text>
                        <View className="ml-2">
                            <ExternalLink size={16} color={Colors.menorah.bg} strokeWidth={2.2} />
                        </View>
                    </Pressable>

                    <View className="mt-6 flex-row items-center">
                        <View className="h-px flex-1 bg-white/10" />
                        <Text className="mx-3 text-[11px] uppercase tracking-[1px] text-menorah-muted">
                            Or give directly
                        </Text>
                        <View className="h-px flex-1 bg-white/10" />
                    </View>

                    <View className="mt-4 gap-3">
                        <CopyField
                            icon={Landmark}
                            label="Bank Transfer"
                            value="1451001026531"
                            subtitle="GTBank · Seth Owusu"
                        />
                        <CopyField icon={Smartphone} label="Mobile Money" value="0240312551" />
                        <CopyField icon={Mail} label="PayPal" value="sethchrista8@gmail.com" />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default GivingPaymentModal
