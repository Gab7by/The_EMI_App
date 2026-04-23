import { profileManagementCategory } from "@/types/profile-types"
import { Pressable, Text, View } from "react-native"
import { Icon } from "../ui/icon"
import { ChevronRight } from "lucide-react-native"
import { Colors } from "@/constants/theme"

const ProfileCategory = ({onPressFunction, icon, categoryName, categoryDescription, categoryIconColor}:profileManagementCategory) => {
    return (
        <Pressable onPress={onPressFunction} className="p-4 bg-menorah-darkGreen rounded-xl">
            <View className="flex-row justify-center items-center">
                <View className="rounded-full p-2 justify-center mr-4" style={{backgroundColor: categoryIconColor ? categoryIconColor : Colors.menorah.primary}}>
                    <Icon as={icon} size={24} />
                </View>
                <View className="flex-1 justify-center gap-1">
                    <Text className="text-white font-bold">{categoryName}</Text>
                    {categoryDescription && (<Text className="text-white text-xs">{categoryDescription}</Text>)}
                </View>
                <View>
                    <ChevronRight size={28} color={Colors.menorah.primary} />
                </View>
            </View>
        </Pressable>
    )
}

export default ProfileCategory