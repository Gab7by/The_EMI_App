import { supabase } from "@/lib/supabase";
import { profileManagementCategory } from "@/types/profile-types";
import { Images, LogOut, Share, Text, User } from "lucide-react-native";
import { Alert } from "react-native";
import { Colors } from "./theme";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

const goToAccountDetails = () => {
    router.push("/(profile)/account")
}

const goToSliderImages = () => {
    router.push("/(profile)/slider-images")
}

const logoutUser = () => {
    useAuthStore.getState().clearAuth()
    router.replace("/(auth)")
    supabase.auth.signOut()
    }

    const alertUserOfLogout = () => {
        Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
            { text: 'Cancel', style: 'cancel', isPreferred: true },
            { text: 'Logout', style: 'destructive', onPress: logoutUser},
            
    ])}

export const ProfileManagementCategories: profileManagementCategory[] = [
    {
        key: "account",
        categoryName: "My Account",
        icon: User,
        categoryDescription: "Update your account details",
        onPressFunction: goToAccountDetails
    },
    {
        key: "slider-images",
        categoryName: "Home Slider Images",
        icon: Images,
        categoryDescription: "Manage the images shown on the home screen",
        onPressFunction: goToSliderImages,
        adminOnly: true
    },
    {
        key: "share",
        categoryName: "Share App",
        icon: Share,
        categoryDescription: "Get others to download the app"
    },
    {
        key: "legal",
        categoryName: "Legal",
        icon: Text,
        categoryDescription: "View terms, privacy policy and other legal info."
    },
    {
        key: "logout",
        categoryName: "Logout",
        icon: LogOut,
        categoryIconColor: Colors.menorah.error,
        onPressFunction: alertUserOfLogout
    }
]
