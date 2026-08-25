import { Stack } from "expo-router"

const TestimoniesLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="testimonies" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add" />
    </Stack>
  )
}

export default TestimoniesLayout