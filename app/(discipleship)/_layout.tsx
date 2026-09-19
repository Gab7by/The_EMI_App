import { Stack } from "expo-router"

const DiscipleshipDetailLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="[id]" />
  </Stack>
)

export default DiscipleshipDetailLayout
