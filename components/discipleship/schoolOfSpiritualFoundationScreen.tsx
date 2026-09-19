import AccordionSection from "@/components/discipleship/accordionSection"
import type { LearningPath } from "@/constants/discipleship"
import {
  ACCORDION_SECTIONS,
  CLOSING_STATEMENT,
  CURRICULUM_TOPICS,
  ENROLLMENT_CTA,
  PROGRAM_WEEKS,
  SSF_BYLINE,
} from "@/constants/schoolOfSpiritualFoundation"
import { Fonts } from "@/constants/theme"
import { hapticMedium } from "@/lib/haptics"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { useRef, useState } from "react"
import { Animated, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const WELCOME_PARAGRAPHS = [
  "Welcome to the School of Spiritual Foundation (SSF), an intensive 8-week discipleship and spiritual formation journey designed to establish you in sound biblical doctrine, cultivate spiritual discipline, strengthen your walk with Christ, and prepare you for Kingdom service and impact.",
  "SSF is more than a teaching program - it is a foundation-building season. Throughout these eight weeks, you will be challenged to grow in the Word, prayer, holiness, consecration, evangelism, spiritual discipline, and practical Kingdom service.",
  "Our desire is not merely that you learn, but that you are formed, transformed, equipped, and commissioned.",
  "Your journey begins here. Build the foundation. Deepen the roots. Embrace the call. Prepare for Kingdom impact.",
]

const SchoolOfSpiritualFoundationScreen = ({ path }: { path: LearningPath }) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const confirmationOpacity = useRef(new Animated.Value(0)).current

  const handleEnrollmentPress = () => {
    hapticMedium()
    setShowConfirmation(true)
    confirmationOpacity.setValue(0)
    Animated.timing(confirmationOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start()
  }

  return (
    <SafeAreaView
      className="flex-1 bg-menorah-bg px-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-14 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>

        {/* Header */}
        <View className="mt-8 items-center px-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl border border-menorah-primary/25 bg-menorah-primary/10">
            <MaterialCommunityIcons name={path.icon} size={36} color="#C6FF00" />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-white">
            {path.title}
          </Text>
          <Text className="mt-1 text-center text-[13px] text-menorah-muted">
            {SSF_BYLINE}
          </Text>
          <Text className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[1px] text-menorah-primary/80">
            {PROGRAM_WEEKS} Weeks · {CURRICULUM_TOPICS.length} Topics
          </Text>
        </View>

        {/* Welcome - always visible, the emotional hook */}
        <View className="mt-8">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
            Welcome
          </Text>
          {WELCOME_PARAGRAPHS.map((paragraph) => (
            <Text key={paragraph} className="mt-3 text-[15px] leading-[26px] text-white/90">
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Curriculum - always visible, the most concrete, appetite-whetting content */}
        <View className="mt-7">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
            What This School Entails
          </Text>
          <View className="mt-3 gap-3 rounded-2xl border border-menorah-primary/15 bg-menorah-darkGreen p-4">
            {CURRICULUM_TOPICS.map((topic) => (
              <View key={topic.id} className="flex-row items-start gap-3">
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#C6FF00" />
                <Text className="flex-1 text-[14px] leading-5 text-white/90">{topic.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Program details - the operational content, tap to explore */}
        <Text className="mb-1 mt-8 text-[11px] font-semibold uppercase tracking-[1px] text-menorah-gray">
          Program Details
        </Text>
        {ACCORDION_SECTIONS.map((section) => (
          <AccordionSection key={section.id} content={section} />
        ))}

        {/* Closing charge - a send-off, not something to hide behind a tap */}
        <View className="mt-6 items-center rounded-2xl bg-menorah-gold/10 px-6 py-7">
          <Text className="text-[13px] font-bold uppercase tracking-[1.5px] text-menorah-gold">
            {CLOSING_STATEMENT.title}
          </Text>
          <Text className="mt-3 text-center text-[14px] leading-6 text-white/90">
            {CLOSING_STATEMENT.body}
          </Text>
          <Text
            style={{ fontFamily: Fonts?.serif }}
            className="mt-3 text-center text-[15px] italic text-white"
          >
            {CLOSING_STATEMENT.charge}
          </Text>
        </View>

        {/* Enrollment - a real button, but tinted/outlined rather than
            solid-filled like a true submit action, since nothing is
            actually being submitted yet. */}
        <Pressable
          onPress={handleEnrollmentPress}
          className="mt-6 w-full flex-row items-center justify-center gap-2 rounded-full border-2 border-menorah-primary bg-menorah-primary/10 py-4"
        >
          <MaterialCommunityIcons name="calendar-clock" size={20} color="#C6FF00" />
          <Text className="text-base font-bold text-menorah-primary">{ENROLLMENT_CTA.label}</Text>
        </Pressable>

        {showConfirmation && (
          <Animated.View style={{ opacity: confirmationOpacity }}>
            <Text className="mt-3 text-center text-[13px] italic text-menorah-gold">
              {ENROLLMENT_CTA.confirmation}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default SchoolOfSpiritualFoundationScreen
