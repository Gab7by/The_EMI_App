import { Image } from "expo-image"
import { X } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type ImageViewerModalProps = {
  visible: boolean
  images: string[]
  initialIndex: number
  onClose: () => void
}

/**
 * Full-screen photo viewer - tap a thumbnail to open, swipe between photos
 * if there's more than one, tap the X or the backdrop to close.
 */
export default function ImageViewerModal({ visible, images, initialIndex, onClose }: ImageViewerModalProps) {
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset to whichever thumbnail was tapped each time the viewer reopens.
  useEffect(() => {
    if (visible) setCurrentIndex(initialIndex)
  }, [visible, initialIndex])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentIndex(page)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: initialIndex * width, y: 0 }}
          onMomentumScrollEnd={handleScroll}
        >
          {images.map((uri) => (
            <Pressable key={uri} onPress={onClose} style={{ width, height: "100%" }}>
              <Image
                source={{ uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            </Pressable>
          ))}
        </ScrollView>

        <SafeAreaView className="absolute left-0 right-0 top-0" pointerEvents="box-none">
          <View className="flex-row items-center justify-between px-4 pt-2">
            {images.length > 1 ? (
              <View className="rounded-full bg-black/50 px-3 py-1.5">
                <Text className="text-[12px] font-semibold text-white">
                  {currentIndex + 1} / {images.length}
                </Text>
              </View>
            ) : (
              <View />
            )}
            <Pressable
              onPress={onClose}
              hitSlop={12}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <X size={20} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}
