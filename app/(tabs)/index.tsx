import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Home = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <View>
        <Text className="text-3xl text-red-500">
          Welcome to Menorrah
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default Home