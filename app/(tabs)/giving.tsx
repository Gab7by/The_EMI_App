import { ScrollView, View, Text, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Wallet } from "lucide-react-native"
import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import GivingRow from "@/components/giving/givingRow"
import { openPaymentLink } from "@/lib/giving"
import { Colors } from "@/constants/theme"

const GivingScreen = () => {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-4 gap-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <PodcastProfileBar />

        <View className="gap-1">
          <Text className="text-3xl font-bold text-menorah-primary">Giving</Text>
          <Text className="text-menorah-muted text-base">Support the ministry</Text>
        </View>

        <Text className="text-menorah-primary text-lg font-bold">
          Become a partner
        </Text>

        <GivingRow
          icon={Wallet}
          title="Offering, Tithes & more"
          description="Support the general ministry and operations"
          iconColor={Colors.menorah.primary}
          onPress={openPaymentLink}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default GivingScreen
