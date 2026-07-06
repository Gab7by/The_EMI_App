import { Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const LibraryScreen = () => {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-menorah-primary text-3xl font-bold mb-4">Library</Text>
        <Text className="text-white text-lg text-center">
          Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default LibraryScreen