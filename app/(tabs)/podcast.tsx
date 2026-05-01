import ImageSlider from "@/components/commons/image-slider";
import LiveStreamCard from "@/components/podcast/livestreamCard";
import LiveStreamInfoModal from "@/components/podcast/livestreamInfoModal";
import LiveStreamStartDialogModal from "@/components/podcast/liveStreamStartDialogModal";
import LiveStreamStartModal from "@/components/podcast/liveStreamStartModal";
import LiveStreamVisibilityModal from "@/components/podcast/livestreamVisiblityModal";
import NoLiveStreamCard from "@/components/podcast/no-live-podcast";
import PodcastLoadingSkeleton from "@/components/podcast/podcast-loading-skeleton";
import PodcastProfileBar from "@/components/profile/podcastProfileBar";
import { Button } from "@/components/ui/button";
import { imageItems } from "@/constants/podcast";
import { useLivePodcastSessions } from "@/hooks/tanstack-query-hooks";
import { createLivePodcast } from "@/lib/podcast";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useLiveStreamStartModalStore } from "@/store/podcast-store";
import { Playlist, PLAYLIST_OPTIONS, PlaylistOption, PLAYLISTS } from "@/types/podcast-types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PodcastScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isunlisted, setIsUnlisted] = useState<boolean>(false);

  const [playlist, setPlaylist] = useState<PlaylistOption>(PLAYLIST_OPTIONS[0]);
  const [title, setTitle] = useState<string>("");

  const [errorStartingLivePodcast, setErrorStartingLivePodcast] = useState<string | null>(null)

  const [isCreatingLivePodcast, setIsCreatingLivePodcast] =
    useState<boolean>(false)

  const setOpenLiveStreamStartModal = useLiveStreamStartModalStore(
    (state) => state.setIsOpen,
  );

  const profile = useAuthStore((state) => state.profile);
  const isAdmin = profile?.role === "admin";

  const openLiveStreamStartModal = () => {
    setOpenLiveStreamStartModal(true);
  };

  const { data, isLoading, isRefetching, refetch } = useLivePodcastSessions();

  const startLiveStream = (closeModal: () => void) => {
    if(title.length < 1) {
        setErrorStartingLivePodcast("Podcast title is required")
        setTimeout(() => {
            setErrorStartingLivePodcast(null)
        }, 2000)
        return
    }
    setIsCreatingLivePodcast(true);
    createLivePodcast({
      is_public: isPublic,
      is_unlisted: isunlisted,
      start_time: new Date().toISOString(),
      title: title,
      playlist: playlist.value as Playlist,
    }).then((livePodcast) => {
      setIsCreatingLivePodcast(false);
      if (livePodcast === null) {
        return;
      }
      setIsPublic(true);
      setIsUnlisted(false);
      setPlaylist(PLAYLIST_OPTIONS[0]);
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["live-podcast-sessions"] });
      closeModal();
      setTimeout(() => {
        router.push(
            {
                pathname: "/(podcast)/live-podcast-admin",
                params: {
                    id: livePodcast.id,
                    playlist: livePodcast.playlist,
                    title: livePodcast.title,
                    hostId: livePodcast.host.id,
                    hostName: livePodcast.host.full_name,
                    hostPictureUrl: livePodcast.host.avatar_url,
                    livekitRoomName: livePodcast.livekit_room_name
                }
            }
        )
      }, 100);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg py-8 px-4 gap-4 relative">
      <PodcastProfileBar />
      <ImageSlider items={imageItems} height={220} />
      {isLoading ? (
        <PodcastLoadingSkeleton />
      ) : (
        <FlashList
            ListEmptyComponent={<NoLiveStreamCard />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: insets.bottom + 80}}
            ListHeaderComponent={
                <Text className="text-xl font-bold text-menorah-goldDark mb-4">
                    Livestreams
                </Text>
            }
            data={data}
            renderItem={({ item }) => (
                <LiveStreamCard
                    livekitRoomName={item.livekit_room_name}
                    playlist={item.playlist}
                    hostId={item.host.id}
                    id={item.id}
                    hostName={item.host.full_name!}
                    title={item.title}
                    hostPictureUrl={item.host.avatar_url}
                />
            )}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
        />
      )}
      {isAdmin && (
        <View className="items-center absolute bottom-32 left-4 right-4">
          <Button
            onPress={openLiveStreamStartModal}
            size="icon"
            className="bg-menorah-primary p-7 rounded-full"
          >
            <Plus size={35} color="white" />
          </Button>
        </View>
      )}
      {isAdmin && (
        <>
          <LiveStreamStartModal />
          <LiveStreamStartDialogModal
            isPublic={isPublic}
            playlist={playlist.value}
            errorStartingLivePodcast={errorStartingLivePodcast}
            startLiveStream={startLiveStream}
            isCreatingLivePodcast={isCreatingLivePodcast}
          />
          <LiveStreamInfoModal
            playlist={playlist}
            errorStartingLivePodcast={errorStartingLivePodcast}
            setPlaylist={setPlaylist}
            setTitle={setTitle}
            title={title}
            startLiveStream={startLiveStream}
            isCreatingLivePodcast={isCreatingLivePodcast}
          />
          <LiveStreamVisibilityModal
            isPublic={isPublic}
            isUnlisted={isunlisted}
            setIsPublic={setIsPublic}
            setIsUnlisted={setIsUnlisted}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default PodcastScreen
