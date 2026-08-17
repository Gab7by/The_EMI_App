import LearningPathCard from "@/components/discipleship/learningPathCard";
import PodcastProfileBar from "@/components/profile/podcastProfileBar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const learningPaths = [
  {
    icon: "school" as const,
    title: "School Of Spiritual Foundation",
    description: "Build a strong foundation in Christian principles and practices",
    moduleCount: 12,
  },
  {
    icon: "hands-pray" as const,
    title: "School Of Ministry",
    description: "Discover and develop your spiritual gifts for service",
    moduleCount: 16,
  },
  {
    icon: "human-child" as const,
    title: "Sonship Submission",
    description: "Understanding your identity as a child of God",
    moduleCount: 8,
  },
  {
    icon: "account-supervisor" as const,
    title: "Mentorship",
    description: "One-on-one guidance from experience spiritual leaders.",
    moduleCount: 10,
  },
  {
    icon: "meditation" as const,
    title: "School Of Christian Mysticism",
    description: "Deep dive into contemplative prayer and spiritual intimacy.",
    moduleCount: 10,
  },
];

const DiscipleshipScreen = () => {
  const insets = useSafeAreaInsets();

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
          {learningPaths.map((path) => (
            <LearningPathCard
              key={path.title}
              icon={path.icon}
              title={path.title}
              description={path.description}
              moduleCount={path.moduleCount}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscipleshipScreen;
