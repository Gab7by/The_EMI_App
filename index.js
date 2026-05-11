import { registerGlobals } from "@livekit/react-native";
import ReactNativeForegroundService from "@supersami/rn-foreground-service"

registerGlobals()

ReactNativeForegroundService.register({
  config: {
    alert: false,
    onServiceErrorCallBack: () => {},
  },
})

import "expo-router/entry"
