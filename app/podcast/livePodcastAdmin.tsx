import TreeButton from "@/assets/svgs/button_vector_tree.svg";
import HugeIcon from "@/assets/svgs/hugeicons_note.svg";
import LivePeople from "@/assets/svgs/live_people_icon.svg";
import MessagingButton from "@/assets/svgs/messaging_button.svg";
import MicrophoneButton from "@/assets/svgs/microphone_button.svg";
import MusicButton from "@/assets/svgs/music_button_icon.svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Power,
  Share2
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
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

const AdminLivePodcast = () => {
  return (
    <LinearGradient
      colors={["#143703", "#4a7108", "#143703"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
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
                  <Text className="text-base text-sm text-menorah-whiteSoft">
                    Lunch Prayer Fire
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Text className="text-[10px] text-menorah-whiteSoft/70">
                      Prophet Seth Owusu
                    </Text>
                    <View className="ml-2">
                        <LivePeople  width={10} height={10} />
                    </View>
                    
                    <Text className=" ml-0.5 text-[9px] text-menorah-whiteSoft/60">
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
                <View className="rounded-full bg-[#F3523C]/20 p-2">
                  <Power size={23} color="#FF5A45" strokeWidth={2} />
                </View>
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

              
              <View className="w-[19%] items-center">
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
                    #1 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #2 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #3 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #4 Call In
                  </Text>
              </View>

           
              <View className="w-[19%] items-center">
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
                    #5 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #6 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #7 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #8 Call In
                  </Text>
              </View>

              <View className="w-[19%] items-center">
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
                    #9 Call In
                  </Text>
              </View>

            </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          >
            <View className="mb-7 rounded-[22px] bg-menorah-bg px-4 py-4">
              <Text className="text-[12px] leading-5 text-[#FFD700]">
                Please keep comments respectful and uplifting. &quot;Let your
                words edify and bring grace to those who hear.&quot; - Ephesians
                4:29. Please keep comments respectful and uplifting. &quot;Let
                your words edify and bring grace to those who hear.&quot; -
                Ephesians 4:29.
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

        <View className="absolute bottom-0 left-0 right-0 bg-[#143703] px-7 pb-10 pt-3">
          <View className="flex-row items-center justify-between">
            <TreeButton width={25} height={25} />
            <MusicButton width={25} height={25} />
            <MessagingButton width={25} height={25} />
            <MicrophoneButton width={25} height={25} />
          </View>
          
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AdminLivePodcast;