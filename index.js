import { registerGlobals } from "@livekit/react-native";
import ReactNativeForegroundService from "@supersami/rn-foreground-service"

registerGlobals()

ReactNativeForegroundService.register()

import "expo-router/entry"