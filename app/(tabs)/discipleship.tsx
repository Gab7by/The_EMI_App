import LearningPathCard from "@/components/discipleship/learningPathCard";
import PodcastProfileBar from "@/components/profile/podcastProfileBar";
import { LEARNING_PATHS } from "@/constants/discipleship";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const DiscipleshipScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-menorah-bg px-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-4 gap-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <PodcastProfileBar />

        <View className="gap-1">
          <Text className="text-3xl font-bold text-menorah-primary">Discipleship</Text>
          <Text className="text-menorah-muted text-base">Grow in your faith journey</Text>
        </View>

        <Text className="text-menorah-primary text-lg font-bold">
          Learning Paths
        </Text>

        <View className="gap-3">
          {LEARNING_PATHS.map((path) => (
            <LearningPathCard
              key={path.id}
              icon={path.icon}
              title={path.title}
              description={path.description}
              moduleCount={path.moduleCount}
              locked={path.locked}
              onPress={path.locked ? undefined : () => router.push(`/(discipleship)/${path.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscipleshipScreen;
