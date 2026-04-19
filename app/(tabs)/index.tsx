import ArrowRight from "@/assets/svgs/arrow-right.svg"
import Sparkling from "@/assets/svgs/sparkling.svg"
import ImageSlider from "@/components/commons/image-slider"
import HomeProfileBar from "@/components/profile/homePofileBar"
import { imageItems } from "@/constants/podcast"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"




const Home = () => {
  
  return (
    <SafeAreaView className="flex-1 gap-7 px-4 py-8 bg-menorah-bg">
      <HomeProfileBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6">
        <ImageSlider items={imageItems} height={220} />
        <View className="gap-5">
          <Text className="text-xl font-bold text-[#EFBF04]">The Menorah</Text>
          <View className="justify-center bg-[#C6FF00] p-7 rounded-3xl w-full ">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home
