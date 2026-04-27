import Call from "@/assets/svgs/call_icon.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import MoneyIcon from "@/assets/svgs/send_money_icon.svg";
import {
  PodcastBottomDock,
  PodcastBottomSheet,
  PodcastComments,
  PodcastDialog,
  PodcastFullScreenModal,
  PodcastHeader,
  PodcastParticipantsGrid,
  podcastCurrencies,
  podcastPaymentMethods,
  renderPaymentMethodIcon,
  usePodcastFooterLayout,
  type PodcastCurrencyOption,
} from "@/components/podcast/livePodcastShared";
import { useLivePodcastParticipants } from "@/hooks/tanstack-query-hooks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, ChevronRight, Power, Share2, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MemberLivePodcast = () => {
  const { id, playlist, hostId, hostName, hostPictureUrl } = useLocalSearchParams<{
    id: string;
    title: string;
    hostId: string;
    hostName: string;
    hostPictureUrl: string;
    playlist: string;
  }>();

  const router = useRouter();
  const { data: participantCount } = useLivePodcastParticipants(hostId, id);
  const { footerBottom, footerPaddingBottom, scrollPaddingBottom, handleFooterLayout } =
    usePodcastFooterLayout();

  const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  const [isCurrencySheetVisible, setIsCurrencySheetVisible] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] =
    useState<PodcastCurrencyOption["id"]>("usd");

  const selectedCurrency = useMemo(
    () =>
      podcastCurrencies.find((currency) => currency.id === selectedCurrencyId) ??
      podcastCurrencies[1],
    [selectedCurrencyId]
  );

  return (
    <LinearGradient
      colors={["#143703", "#4a7108", "#143703"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4 pt-3">
          <PodcastHeader
            playlist={playlist}
            hostName={hostName}
            hostPictureUrl={hostPictureUrl}
            participantCount={participantCount}
            actions={
              <>
                <View className="ml-7">
                  <HugeIcon width={30} height={30} />
                </View>
                <Share2 size={25} color="#F3F6E7" strokeWidth={1.2} />
                <Pressable
                  onPress={() => setIsExitPromptVisible(true)}
                  className="rounded-full bg-[#F3523C]/20 p-2"
                >
                  <Power size={23} color="#FF5A45" strokeWidth={2} />
                </Pressable>
              </>
            }
          />

          <PodcastParticipantsGrid
            hostName={hostName}
            hostPictureUrl={hostPictureUrl}
          />

          <PodcastComments footerPadding={scrollPaddingBottom} />
        </View>

        <PodcastBottomDock
          bottom={footerBottom}
          paddingBottom={footerPaddingBottom}
          onLayout={handleFooterLayout}
        >
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 flex-1 flex-row items-center rounded-2xl border border-white bg-[#143703] px-5 py-3">
              <TextInput
                placeholder="Input your message"
                placeholderTextColor="#A9A9A9"
                className="flex-1 text-[14px] text-white"
                returnKeyType="send"
              />
            </View>

            <View className="flex-row items-center gap-4">
              <MaterialCommunityIcons name="heart" size={36} color="#FF4B1F" />
              <Call width={34} height={34} />
              <Pressable onPress={() => setIsPaymentMethodsVisible(true)} hitSlop={10}>
                <MoneyIcon width={34} height={34} />
              </Pressable>
            </View>
          </View>
        </PodcastBottomDock>

        <PodcastDialog
          visible={isExitPromptVisible}
          onClose={() => setIsExitPromptVisible(false)}
        >
          <View className="w-full max-w-[360px] overflow-hidden rounded-[20px] bg-[#014C22]">
            <Pressable
              onPress={() => setIsExitPromptVisible(false)}
              className="absolute right-5 top-5 z-10"
              hitSlop={12}
            >
              <X size={25} color="#F5F5F5" strokeWidth={2.4} />
            </Pressable>

            <View className="px-7 pb-5 pt-10">
              <Text className="text-center text-[18px] font-semibold text-[#D7FF00]">
                Exit The Live Room?
              </Text>
              <Text className="mt-9 text-center text-[14px] text-[#95A89C]">
                Are you sure you want to exit the live {"\n"} room?
              </Text>
            </View>

            <View className="flex-row">
              <Pressable
                onPress={() => {
                  setIsExitPromptVisible(false);
                  router.replace("/(tabs)/podcast");
                }}
                className="flex-1 items-center justify-center bg-[#D7FF00] px-4 py-4"
              >
                <Text className="text-[18px] font-medium text-black">Leave</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsExitPromptVisible(false)}
                className="flex-1 items-center justify-center bg-[#01411D] px-4 py-4"
              >
                <Text className="text-[18px] font-medium text-[#D7FF00]">Stay</Text>
              </Pressable>
            </View>
          </View>
        </PodcastDialog>

        <PodcastFullScreenModal
          visible={isPaymentMethodsVisible}
          onClose={() => {
            setIsCurrencySheetVisible(false);
            setIsPaymentMethodsVisible(false);
          }}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={() => {
                  setIsCurrencySheetVisible(false);
                  setIsPaymentMethodsVisible(false);
                }}
                hitSlop={12}
                className="self-start py-3 pr-3"
              >
                <ArrowLeft size={34} color="#F4F5F0" strokeWidth={2.2} />
              </Pressable>

              <Pressable
                onPress={() => setIsCurrencySheetVisible(true)}
                className="mt-4 w-[250px] rounded-[24px] bg-[#013220] px-4 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
                      <Text className="text-[11px] font-semibold text-[#013220]">
                        {selectedCurrency.flag}
                      </Text>
                    </View>
                    <Text className="ml-4 text-[18px] font-semibold text-[#F4F5F0]">
                      Currency
                    </Text>
                  </View>

                  <ChevronDown size={34} color="#D7FF00" strokeWidth={3} />
                </View>
              </Pressable>

              <Text className="mt-8 text-[18px] font-semibold text-[#F4F5F0]">
                Select payment method
              </Text>

              <View className="mt-4 gap-4">
                {podcastPaymentMethods.map((method) => (
                  <Pressable
                    key={method.id}
                    className="h-[80px] rounded-[24px] bg-[#013220] px-5 py-6"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="mr-4 flex-1 flex-row items-center">
                        <View className="h-[30px] w-[30px] items-center justify-center">
                          {renderPaymentMethodIcon(method.iconKey)}
                        </View>

                        <View className="ml-5 flex-1">
                          <Text className="text-[18px] font-medium text-[#F4F5F0]">
                            {method.title}
                          </Text>
                          {method.subtitle ? (
                            <Text className="mt-2 text-[14px] text-[#E4EAE3]">
                              {method.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {method.trailing === "chevron" ? (
                        <ChevronRight size={34} color="#D7FF00" strokeWidth={2.7} />
                      ) : (
                        <MaterialCommunityIcons
                          name="content-copy"
                          size={34}
                          color="#D7FF00"
                        />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </SafeAreaView>

          <PodcastBottomSheet
            visible={isCurrencySheetVisible}
            onClose={() => setIsCurrencySheetVisible(false)}
          >
            <View className="items-center">
              <View className="h-[4px] w-[82px] rounded-full bg-[#E8E8E8]" />
            </View>

            <View className="mt-8 gap-8">
              {podcastCurrencies.map((currency) => (
                <Pressable
                  key={currency.id}
                  onPress={() => {
                    setSelectedCurrencyId(currency.id);
                    setIsCurrencySheetVisible(false);
                  }}
                  className="flex-row items-center"
                >
                  <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
                    <Text className="text-[11px] font-semibold text-[#013220]">
                      {currency.flag}
                    </Text>
                  </View>
                  <Text className="ml-4 text-[16px] font-medium text-[#F4F5F0]">
                    {currency.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </PodcastBottomSheet>
        </PodcastFullScreenModal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MemberLivePodcast;
