import "./lib/reanimatedConfig"
import { registerGlobals } from "@livekit/react-native";
import { registerForegroundService } from "./lib/foreground-service"

registerGlobals()

registerForegroundService({
  config: {
    alert: false,
    onServiceErrorCallBack: () => {},
  },
})

import "expo-router/entry"
