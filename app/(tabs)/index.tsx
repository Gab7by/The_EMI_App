import ArrowRight from "@/assets/svgs/arrow-right.svg"
import Sparkling from "@/assets/svgs/sparkling.svg"
import ImageSlider from "@/components/commons/image-slider"
import HomeProfileBar from "@/components/profile/homePofileBar"
import HomeProfileModal from "@/components/profile/homeProfileModal"
import { imageItems } from "@/constants/podcast"
import { Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"




const Home = () => {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 gap-6 px-4 py-5 bg-menorah-bg" style={{ paddingBottom: insets.bottom + 16 }}>
      <HomeProfileBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <ImageSlider items={imageItems} height={196} />
        <View className="gap-4">
          <View><Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">Welcome home</Text><Text className="mt-1 text-2xl font-bold text-white">The Menorah</Text></View>
          <LinearGradient
            colors={["#D8FF37", "#B7EC00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ overflow: 'hidden', borderRadius: 28, padding: 24, alignItems: 'flex-start' }}
          >
            <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
            <View className="mb-6 self-start">
              <Sparkling width={25} height={25} />
            </View>
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-[#0B1F0E]/70">Featured teaching</Text>
            <Text className="text-left text-xl font-bold text-[#0B1F0E]">Manifestation Of The Sons of God</Text>
            <Text className="mt-2 text-left text-sm leading-5 text-[#0B1F0E]/80">Raising mature sons for Kingdom dominion.</Text>
            <Pressable
              className="mt-6 h-11 w-32 flex-row items-center justify-start rounded-2xl bg-[#0B1F0E] pl-3">
              <Text className="text-white font-bold mr-2">Read More</Text>
              <ArrowRight width={10} height={10} />
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
      <HomeProfileModal />
    </SafeAreaView>
  )
}

export default Home
