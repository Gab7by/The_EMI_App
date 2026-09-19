import { Fonts } from "@/constants/theme"
import type { AccordionSectionContent } from "@/constants/schoolOfSpiritualFoundation"
import { hapticLight } from "@/lib/haptics"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { memo, useRef, useState } from "react"
import { Animated, type LayoutChangeEvent, Pressable, Text, View } from "react-native"

// Renders whichever optional fields `content` carries, always in this
// fixed order, so every section reads the same way regardless of which
// combination of blocks it actually uses.
const SectionBody = ({ content }: { content: AccordionSectionContent }) => (
  <>
    {content.subtitle && (
      <Text className="text-[13px] font-bold text-white/95">{content.subtitle}</Text>
    )}

    {content.paragraphs?.map((paragraph) => (
      <Text key={paragraph} className="mt-2 text-[14px] leading-6 text-white/85">
        {paragraph}
      </Text>
    ))}

    {content.steps?.map((step, index) => (
      <View key={step.title} className="mt-3 flex-row gap-3">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-menorah-primary/15">
          <Text className="text-[12px] font-bold text-menorah-primary">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-white">{step.title}</Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-menorah-muted">{step.description}</Text>
        </View>
      </View>
    ))}

    {content.bulletGroups ? (
      content.bulletGroups.map((group) => (
        <View key={group.label} className="mt-3">
          <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-menorah-gold">
            {group.label}
          </Text>
          {group.items.map((item) => (
            <View key={item} className="mt-2 flex-row gap-2">
              <View className="mt-2 h-1.5 w-1.5 rounded-full bg-menorah-primary" />
              <Text className="flex-1 text-[13px] leading-5 text-white/85">{item}</Text>
            </View>
          ))}
        </View>
      ))
    ) : content.bullets ? (
      <View className="mt-3">
        {content.bulletsLabel && (
          <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-menorah-gold">
            {content.bulletsLabel}
          </Text>
        )}
        {content.bullets.map((item) => (
          <View key={item} className="mt-2 flex-row gap-2">
            <View className="mt-2 h-1.5 w-1.5 rounded-full bg-menorah-primary" />
            <Text className="flex-1 text-[13px] leading-5 text-white/85">{item}</Text>
          </View>
        ))}
      </View>
    ) : null}

    {content.callout && (
      <View className="mt-3 flex-row gap-2 rounded-xl border border-menorah-gold/25 bg-menorah-gold/[0.08] p-3">
        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#D4AF37" />
        <Text className="flex-1 text-[13px] leading-5 text-white/85">{content.callout}</Text>
      </View>
    )}

    {content.quote && (
      <View className="mt-3 rounded-2xl bg-menorah-primary/12 px-4 py-4">
        <Text
          style={{ fontFamily: Fonts?.serif }}
          className="text-center text-[15px] italic leading-6 text-menorah-primary"
        >
          {content.quote}
        </Text>
      </View>
    )}

    {content.closingLine && (
      <Text className="mt-3 text-center text-[14px] italic text-menorah-muted">
        {content.closingLine}
      </Text>
    )}
  </>
)

/**
 * One expandable card. Content is static per instance (drawn from a fixed
 * data file, never user-edited), so its natural height is measured once
 * via an invisible off-screen pass and reused as the animation's target -
 * see `measuredHeight` below - rather than re-measuring on every toggle.
 *
 * Uses React Native's core `Animated` API (matching the pattern already
 * used by AudioProgressBar's scrub thumb and MusicSheet's VolumeSlider),
 * not `LayoutAnimation` (unused elsewhere in this app, and has known
 * reliability gaps on Android under the New Architecture this app runs)
 * and not the `accordion-down`/`accordion-up` keyframes already sitting
 * unused in tailwind.config.js (those are a leftover from a shadcn/Radix
 * web preset - they reference a CSS custom property Radix's *web*
 * accordion sets at runtime, which has no NativeWind/React Native
 * equivalent, so they only ever apply on Expo web, never iOS/Android).
 */
const AccordionSection = ({ content }: { content: AccordionSectionContent }) => {
  const [expanded, setExpanded] = useState(false)
  const [measuredHeight, setMeasuredHeight] = useState(0)
  const bodyHeight = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const hasMeasuredRef = useRef(false)

  const handleMeasure = (event: LayoutChangeEvent) => {
    if (hasMeasuredRef.current) return
    hasMeasuredRef.current = true
    setMeasuredHeight(event.nativeEvent.layout.height)
  }

  const toggle = () => {
    hapticLight()
    const next = !expanded
    setExpanded(next)

    Animated.parallel([
      // Height can't be driven natively.
      Animated.timing(bodyHeight, { toValue: next ? measuredHeight : 0, duration: 250, useNativeDriver: false }),
      // Rotation is a transform, so this one can be.
      Animated.timing(rotate, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start()
  }

  const chevronRotate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] })

  return (
    <View className="mt-3 overflow-hidden rounded-[22px] border border-white/10 bg-[#10321D]">
      <Pressable onPress={toggle} className="flex-row items-center px-4 py-4 active:bg-white/5">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-menorah-primary/15">
          <MaterialCommunityIcons name={content.icon} size={16} color="#C6FF00" />
        </View>
        <Text className="ml-3 flex-1 text-[14px] font-bold text-white">{content.title}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#C6FF00" />
        </Animated.View>
      </Pressable>

      <Animated.View style={{ height: bodyHeight, overflow: "hidden" }}>
        <View className="px-4 pb-4">
          <SectionBody content={content} />
        </View>
      </Animated.View>

      {/* Off-screen measuring pass - invisible, never interacted with,
          stays mounted for the component's whole lifetime. Its only job
          is to report the body's natural height once, so the animated
          container above knows what height to expand to. */}
      <View
        style={{ position: "absolute", opacity: 0, left: 0, right: 0, top: 0 }}
        pointerEvents="none"
        onLayout={handleMeasure}
      >
        <View className="px-4 pb-4">
          <SectionBody content={content} />
        </View>
      </View>
    </View>
  )
}

export default memo(AccordionSection)
