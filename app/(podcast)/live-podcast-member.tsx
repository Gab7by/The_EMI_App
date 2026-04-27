import Call from "@/assets/svgs/call_icon.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import LivePeople from "@/assets/svgs/live_people_icon.svg";
import MoneyIcon from "@/assets/svgs/send_money_icon.svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, ChevronRight, Power, Share2, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const comments = [
  {
    id: "1",
    name: "Rev. Mrs. Millicent Kate Owusu",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "By Grace Hun. How about you My Love?",
  },
  {
    id: "2",
    name: "Kingdom Benedict",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yes please Agya. Please, how about you and the family",
  },
  {
    id: "3",
    name: "Uriel Merkabah Owusu-Kwarteng",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message:
      "Yes please Daddy. I am honored to be featured on this beautiful masterpiece. Thank You for having me.",
  },
  {
    id: "4",
    name: "Phanuel El-Eden Owusu-Adinkra$h",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yal Old Bowy. I love you so much! Thank you for having me. Woguan!",
  },
  {
    id: "5",
    name: "Rev. Mrs. Millicent Kate Owusu",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "By Grace Hun. How about you My Love?",
  },
  {
    id: "6",
    name: "Kingdom Benedict",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yes please Agya. Please, how about you and the family",
  },
  {
    id: "7",
    name: "Uriel Merkabah Owusu-Kwarteng",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message:
      "Yes please Daddy. I am honored to be featured on this beautiful masterpiece. Thank You for having me.",
  },
  {
    id: "8",
    name: "Phanuel El-Eden Owusu-Adinkra$h",
    avatar: require("@/assets/pictures/podcast-livestream-image.png"),
    message: "Yal Old Bowy. I love you so much! Thank you for having me. Woguan!",
  }
];

type PaymentMethod = {
  id: "card" | "transfer" | "paypal" | "zelle" | "crypto";
  title: string;
  iconKey: "card" | "transfer" | "paypal" | "zelle" | "crypto";
  trailing: "chevron" | "copy";
  subtitle?: string;
};

type CurrencyOption = {
  id: "ghs" | "usd" | "gbp" | "cad" | "zar";
  label: string;
  flag: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    title: "Card",
    iconKey: "card",
    trailing: "chevron",
  },
  {
    id: "transfer",
    title: "Transfer",
    iconKey: "transfer",
    trailing: "chevron",
  },
  {
    id: "paypal",
    title: "Paypal",
    iconKey: "paypal",
    trailing: "copy",
  },
  {
    id: "zelle",
    title: "Zelle",
    iconKey: "zelle",
    trailing: "copy",
  },
  {
    id: "crypto",
    title: "Cryptocurrency",
    iconKey: "crypto",
    trailing: "chevron",
  },
];

const currencies: CurrencyOption[] = [
  { id: "ghs", label: "Ghana Cedi", flag: "🇬🇭" },
  { id: "usd", label: "United States Dollar", flag: "🇺🇸" },
  { id: "gbp", label: "British Pound", flag: "🇬🇧" },
  { id: "cad", label: "Canadian Dollar", flag: "🇨🇦" },
  { id: "zar", label: "South African Rand", flag: "🇿🇦" },
];

const renderPaymentMethodIcon = (iconKey: PaymentMethod["iconKey"]) => {
  if (iconKey === "paypal") {
    return (
      <Text className="text-[28px] font-bold italic text-[#D7FF00]">
        P
      </Text>
    );
  }

  const iconNameByKey = {
    card: "credit-card-outline",
    transfer: "bank-transfer-out",
    zelle: "alpha-z-circle-outline",
    crypto: "bitcoin",
  } as const;

  return (
    <MaterialCommunityIcons
      name={iconNameByKey[iconKey]}
      size={30}
      color="#D7FF00"
    />
  );
};

const MemberLivePodcast = () => {
  const router = useRouter();
    const [isExitPromptVisible, setIsExitPromptVisible] = useState(false);
    const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
    const [isCurrencySheetVisible, setIsCurrencySheetVisible] = useState(false);
    const [selectedCurrencyId, setSelectedCurrencyId] = useState<CurrencyOption["id"]>("usd");
  
    const openExitPrompt = () => {
      setIsExitPromptVisible(true);
    };
  
    const closeExitPrompt = () => {
      setIsExitPromptVisible(false);
    };
  
    const leaveLiveRoom = () => {
      closeExitPrompt();
      router.replace("/(tabs)/podcast");
    };

    const openPaymentMethods = () => {
      setIsPaymentMethodsVisible(true);
    };

    const closePaymentMethods = () => {
      setIsCurrencySheetVisible(false);
      setIsPaymentMethodsVisible(false);
    };

    const openCurrencySheet = () => {
      setIsCurrencySheetVisible(true);
    };

    const closeCurrencySheet = () => {
      setIsCurrencySheetVisible(false);
    };

    const selectedCurrency =
      currencies.find((currency) => currency.id === selectedCurrencyId) ?? currencies[1];

  return (
    <LinearGradient
      colors={["#143703", "#4a7108", "#143703"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-4 pt-3">
            <View className="mb-10 flex-row items-center justify-between">
              <View className="mr-3 flex-1 flex-row items-center rounded-full bg-menorah-bg px-3 py-3">
                <Image
                  source={require("@/assets/pictures/host_profile_image.png")}
                  style={{ width: 42, height: 42, borderRadius: 21 }}
                  contentFit="cover"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-menorah-whiteSoft">
                    Lunch Prayer Fire
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Text className="text-[10px] text-menorah-whiteSoft/70">
                      Prophet Seth Owusu
                    </Text>
                    <View className="ml-2">
                      <LivePeople width={10} height={10} />
                    </View>

                    <Text className="ml-0.5 text-[9px] text-menorah-whiteSoft/60">
                      388
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="ml-7">
                  <HugeIcon width={30} height={30} />
                </View>
                <View>
                  <Share2 size={25} color="#F3F6E7" strokeWidth={1.2} />
                </View>
                <Pressable onPress={openExitPrompt} className="rounded-full bg-[#F3523C]/20 p-2">
                  <Power size={23} color="#FF5A45" strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            <View className="mb-6 flex-row flex-wrap justify-between gap-y-4">
              <View className="w-[19%] items-center">
                <View className="h-[62px] w-[62px] rounded-full border border-white/40 bg-white/15">
                  <Image
                    source={require("@/assets/pictures/host_profile_image.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    contentFit="cover"
                  />
                </View>
                <Text
                  className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                  numberOfLines={1}
                >
                  Rev. Dr...
                </Text>
              </View>

              {Array.from({ length: 9 }, (_, index) => (
                <View key={index} className="w-[19%] items-center">
                  <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/40 bg-[#C8D2BC]">
                    <Image
                      source={require("@/assets/pictures/call_in_image.png")}
                      style={{ width: "100%", height: "100%", borderRadius: 999 }}
                      contentFit="cover"
                    />
                  </View>
                  <Text
                    className="mt-2 text-center text-[10px] text-menorah-whiteSoft/85"
                    numberOfLines={1}
                  >
                    #{index + 1} Call In
                  </Text>
                </View>
              ))}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 170 }}
            >
              <View className="mb-7 rounded-[22px] bg-menorah-bg px-4 py-4">
                <Text className="text-[12px] leading-5 text-[#FFD700]">
                  Please keep comments respectful and uplifting. &quot;Let your
                  words edify and bring grace to those who hear.&quot; -
                  Ephesians 4:29. Please keep comments respectful and
                  uplifting. &quot;Let your words edify and bring grace to those
                  who hear.&quot; - Ephesians 4:29.
                </Text>
              </View>

              <View className="gap-5">
                {comments.map((comment) => (
                  <View key={comment.id} className="flex-row items-start">
                    <Image
                      source={comment.avatar}
                      style={{ width: 34, height: 34, borderRadius: 17 }}
                      contentFit="cover"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="mb-2 text-[11px] font-medium text-menorah-whiteSoft">
                        {comment.name}
                      </Text>
                      <View className="self-start rounded-2xl bg-white/20 px-4 py-3">
                        <Text className="max-w-[240px] text-[12px] font-semibold leading-4 text-menorah-whiteSoft/95">
                          {comment.message}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View className="absolute bottom-0 left-0 right-0 bg-[#143703] px-4 pt-3 ">
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
                <Call width={34} height={34}
                />
                <Pressable onPress={openPaymentMethods} hitSlop={10}>
                  <MoneyIcon width={34} height={34} />
                </Pressable>
              </View>
            </View>
          </View>

{isExitPromptVisible ? (
          <View className="absolute inset-0 items-center justify-center bg-black/40 px-5">
            <View className="w-full max-w-[360px] overflow-hidden rounded-[20px] bg-[#014C22]">
              <Pressable
                onPress={closeExitPrompt}
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
                  onPress={leaveLiveRoom}
                  className="flex-1 items-center justify-center bg-[#D7FF00] px-4 py-4"
                >
                  <Text className="text-[18px] font-medium text-black">
                    Leave
                  </Text>
                </Pressable>
                <Pressable
                  onPress={closeExitPrompt}
                  className="flex-1 items-center justify-center bg-[#01411D] px-4 py-4"
                >
                  <Text className="text-[18px] font-medium text-[#D7FF00]">
                    Stay
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {isPaymentMethodsVisible ? (
          <View className="absolute inset-0 bg-menorah-bg">
            <SafeAreaView className="flex-1">
              <View className="flex-1 px-6 pt-4">
                <Pressable onPress={closePaymentMethods} hitSlop={12} className="self-start py-3 pr-3">
                  <ArrowLeft size={34} color="#F4F5F0" strokeWidth={2.2} />
                </Pressable>

                <Pressable
                  onPress={openCurrencySheet}
                  className="mt-4 w-[250px] rounded-[24px] bg-[#013220] px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
                        <Text className="text-[18px]">{selectedCurrency.flag}</Text>
                      </View>
                      <Text className="ml-4 text-[18px] font-semibold text-[#F4F5F0]">
                        Currency
                      </Text>
                    </View>

                    <ChevronDown size={34} color="#D7FF00" strokeWidth={3} />
                  </View>
                </Pressable>

                <Text className="mt-8  text-[18px] font-semibold text-[#F4F5F0]">
                  Select payment method
                </Text>

                <View className="mt-4 gap-4">
                  {paymentMethods.map((method) => (
                    <Pressable
                      key={method.id}
                      onPress={() => {}}
                      className="rounded-[24px] bg-[#013220] h-[80px] px-5 py-6"
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
                              <Text
                                className={`mt-2 text-[14px] ${
                                  method.id === "paypal"
                                    ? "text-[#B9C6BC]"
                                    : "text-[#E4EAE3]"
                                }`}
                              >
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

            {isCurrencySheetVisible ? (
              <Pressable
                onPress={closeCurrencySheet}
                className="absolute inset-0 justify-end bg-black/20"
              >
                <Pressable
                  onPress={() => {}}
                  className="rounded-t-[28px] bg-[#013220] px-6 pb-12 pt-3"
                >
                  <View className="items-center">
                    <View className="h-[4px] w-[82px] rounded-full bg-[#E8E8E8]" />
                  </View>

                  <View className="mt-8 gap-8">
                    {currencies.map((currency) => (
                      <Pressable
                        key={currency.id}
                        onPress={() => {
                          setSelectedCurrencyId(currency.id);
                          closeCurrencySheet();
                        }}
                        className="flex-row items-center"
                      >
                        <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
                          <Text className="text-[20px]">{currency.flag}</Text>
                        </View>
                        <Text className="ml-4 text-[16px] font-medium text-[#F4F5F0]">
                          {currency.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default MemberLivePodcast;
