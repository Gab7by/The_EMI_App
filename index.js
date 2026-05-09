import { registerGlobals } from "@livekit/react-native";
import ReactNativeForegroundService from "@supersami/rn-foreground-service"
import TrackPlayer from "react-native-track-player"
import { PlaybackService } from "./services/playback-services";

registerGlobals()

ReactNativeForegroundService.register()

TrackPlayer.registerPlaybackService(() => PlaybackService)

import "expo-router/entry"
