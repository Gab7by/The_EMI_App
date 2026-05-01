import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import {BlurView} from "expo-blur"
import { useLiveStreamInfoModalStore, useLiveStreamStartDialogModalStore, useLiveStreamStartModalStore } from "@/store/podcast-store"
import { ArrowLeft, Loader2 } from "lucide-react-native"
import { Colors } from "@/constants/theme"
import { LiveStreamInfoType, PLAYLIST_OPTIONS, PLAYLISTS } from "@/types/podcast-types"
import { Icon } from "../ui/icon"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TriggerRef } from '@rn-primitives/select';
import * as React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortalHost } from "@rn-primitives/portal"

const LiveStreamInfoModal = ({playlist, setPlaylist, setTitle, title, isCreatingLivePodcast, startLiveStream, errorStartingLivePodcast}:LiveStreamInfoType) => {

    const isModalOpen = useLiveStreamInfoModalStore(state => state.isOpen)
    const setModalOpen = useLiveStreamInfoModalStore(state => state.setIsOpen)

    const setDialogModalOpen = useLiveStreamStartDialogModalStore(state => state.setIsOpen)
 
    const ref = React.useRef<TriggerRef>(null);
    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
        left: 12,
        right: 12,
    }

    const goBackToDialogModal = () => {
        setModalOpen(false)
        setTimeout(() => {
            setDialogModalOpen(true)
        }, 100)
    }

    return (
        <Modal
            visible={isModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setModalOpen(false)}
            style={{backgroundColor: "transparent", flex: 1}}
        >
            <BlurView
                intensity={20}
                tint="dark"
                style={{ flex:  1}}
                onTouchEnd={() => setModalOpen(false)}
            />

            <View
                className="bg-menorah-darkGreen"
                style={{flex: 2}}
            >
                <ScrollView
                    contentContainerClassName="px-5 gap-7"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    >
                    <View className="h-[3px] self-center bg-menorah-primary mt-4 w-[80px]" />
                    <View className="flex-1 gap-7">
                        <View className="flex-row">
                            <Pressable onPress={goBackToDialogModal}>
                                <ArrowLeft size={28} color={Colors.menorah.primary} />
                            </Pressable>
                            <View className="flex-1 items-center">
                                <Text className="text-menorah-primary text-lg font-bold">Livestream Information</Text>
                            </View>
                        </View>
                        <View className="border border-menorah-primary p-3 rounded-2xl gap-1">
                        <Text className="text-menorah-primary text-base">Live Title</Text>
                        <Select
                            value={playlist}
                            onValueChange={(option) => setPlaylist(option!)}
                        >
                            <SelectTrigger ref={ref} className="bg-menorah-darkGreen w-full border-0 rounded-xl px-4 py-2">
                            <SelectValue
                                className="text-menorah-primary font-medium"
                                placeholder="Select a playlist"
                            />
                            </SelectTrigger>
                            <SelectContent
                                portalHost="modal-portal"
                                insets={contentInsets}
                                className="w-full bg-menorah-primary border-0 rounded-2xl overflow-hidden">
                            <SelectGroup>
                                <SelectLabel className="text-menorah-darkGreen/60 text-xs px-4 pt-3 pb-1">
                                    Playlist
                                </SelectLabel>
                                {PLAYLIST_OPTIONS.map((option, index) => (
                                    <View key={option.value}>
                                        <SelectItem
                                            label={option.label}
                                            value={option.value}
                                            className="font-medium p-2"
                                        >
                                            {option.label}
                                        </SelectItem>
                                        {index < PLAYLIST_OPTIONS.length - 1 && (
                                            <View className="h-[0.5px] bg-menorah-darkGreen/20 mx-4" />
                                        )}
                                    </View>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                        </View>
                        <View className="border border-menorah-primary p-4 rounded-2xl gap-1">
                            <Text className="text-menorah-primary text-base">About this livestream</Text>
                            <TextInput
                                inputMode="text"
                                value={title}
                                onChangeText={(text) => setTitle(text)}
                                placeholder="About this livestream"
                                placeholderTextColor={`${Colors.menorah.primary}40`}
                                className="text-menorah-whiteSoft text-base"
                                multiline
                                numberOfLines={2}
                            />
                            {errorStartingLivePodcast && <Text className="text-menorah-error text-xs">{errorStartingLivePodcast}</Text>}
                        </View>
                        <Pressable onPress={() => startLiveStream(() => setModalOpen(false))} className="bg-menorah-primary rounded-full flex-row px-8 py-6 justify-center">
                                {
                                    isCreatingLivePodcast ?
                                    (<View className="pointer-events-none animate-spin">
                                        <Icon as={Loader2} color={Colors.menorah.bg} />
                                    </View>):
                                <Text className="text-menorah-bg font-bold text-base">Start Now</Text>
                                    }
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
            <PortalHost name="modal-portal" />
        </Modal>
    )
}

export default LiveStreamInfoModal