import { supabase } from "@/lib/supabase";
import { profileManagementCategory } from "@/types/profile-types";
import { Images, LogOut, Share, Text, User } from "lucide-react-native";
import { Alert } from "react-native";
import { Colors } from "./theme";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useJoinMenorah } from "@/lib/join-menorah";

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
        categoryDescription: "Get others to download the app",
        onPressFunction: () => {
            // Share functionality - can be implemented with expo-sharing
            Alert.alert("Share App", "Share functionality coming soon!")
        }
    },
    {
        key: "legal",
        categoryName: "Legal",
        icon: Text,
        categoryDescription: "View terms, privacy policy and other legal info.",
        onPressFunction: () => {
            // Legal page navigation
            Alert.alert("Legal", "Legal page coming soon!")
        }
    },
    {
        key: "logout",
        categoryName: "Logout",
        icon: LogOut,
        categoryIconColor: Colors.menorah.error,
        onPressFunction: alertUserOfLogout
    }
]

export const GuestProfileCategories: profileManagementCategory[] = [
    {
        key: "join",
        categoryName: "Join Menorah",
        icon: User,
        categoryDescription: "Create an account to unlock all features",
        onPressFunction: () => {
            // We need to use the hook here, but this is a constant file
            // The actual join action will be handled by the component using useJoinMenorah
            // This is a placeholder - the component will override
        }
    },
    {
        key: "share",
        categoryName: "Share App",
        icon: Share,
        categoryDescription: "Get others to download the app",
        onPressFunction: () => {
            Alert.alert("Share App", "Share functionality coming soon!")
        }
    },
    {
        key: "legal",
        categoryName: "Legal",
        icon: Text,
        categoryDescription: "View terms, privacy policy and other legal info.",
        onPressFunction: () => {
            Alert.alert("Legal", "Legal page coming soon!")
        }
    }
]
