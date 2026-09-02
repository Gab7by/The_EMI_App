import { ScrollView, View, Text } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useState } from "react"
import PodcastProfileBar from "@/components/profile/podcastProfileBar"
import GivingRow from "@/components/giving/givingRow"
import GivingPaymentModal from "@/components/giving/givingPaymentModal"
import { GIVING_TILES, type GivingTile } from "@/lib/giving"

const GivingScreen = () => {
  const insets = useSafeAreaInsets()
  const [selectedTile, setSelectedTile] = useState<GivingTile | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

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

        <View className="gap-3">
          <Text className="text-menorah-primary text-lg font-bold">
            Become a partner
          </Text>

          {GIVING_TILES.map((tile) => (
            <GivingRow
              key={tile.id}
              icon={tile.icon}
              title={tile.title}
              description={tile.description}
              iconColor={tile.iconColor}
              onPress={() => {
                setSelectedTile(tile)
                setIsModalVisible(true)
              }}
            />
          ))}
        </View>
      </ScrollView>

      <GivingPaymentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        icon={selectedTile?.icon ?? GIVING_TILES[0].icon}
        iconColor={selectedTile?.iconColor ?? GIVING_TILES[0].iconColor}
        title={selectedTile?.title ?? ""}
        description={selectedTile?.description ?? ""}
      />
    </SafeAreaView>
  )
}

export default GivingScreen
