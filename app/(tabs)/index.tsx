import ArrowRight from "@/assets/svgs/arrow-right.svg"
import Sparkling from "@/assets/svgs/sparkling.svg"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"




const Home = () => {
  
  return (
    <SafeAreaView className="flex-1 bg-menorah-bg">
      <View className="items-left rounded-3xl w-full max-w-sm h-12 mt-10">
        <Text className="text-xl pl-7 font-bold text-left text-[#EFBF04]">The Menorah</Text>
      </View>
      
      <View className="items-left justify-center bg-[#C6FF00] pl-7 rounded-3xl self-center w-full max-w-sm h-80">
        <View className="mb-7">
          <Sparkling width={25} height={25} />
        </View>
        <Text className="font-left text-sm mb-2 ">Featured</Text>
        <Text className="font-bold text-left text-base">Manifestation Of The Sons of God</Text>
        <Text className="text-left text-sm mt-2">Raising Matured Sons for Kingdom {"\n"}Dominion...</Text>
        <Pressable 
          className="bg-[#0B1F0E] w-32 h-12 flex-row items-center pl-3 justify-start rounded-2xl mt-6">
          <Text className="text-white font-bold mr-2">Read More</Text>
          <ArrowRight width={10} height={10} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Home
