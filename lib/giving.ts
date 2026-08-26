import { Apple, Building2, Sprout, Users, Wallet, type LucideIcon } from "lucide-react-native"
import { Alert, Linking } from "react-native"

export const openPaymentLink = async () => {
    try {
        await Linking.openURL(process.env.EXPO_PUBLIC_PAYSTACK_PAYMENT_URL!)
    } catch (e) {
        console.log(e)
        Alert.alert("Something went wrong", "Please try again later")
    }
}

export type GivingTile = {
    id: string
    title: string
    description: string
    icon: LucideIcon
    iconColor: string
}

export const GIVING_TILES: GivingTile[] = [
    {
        id: "offering-tithe",
        title: "Offering & Tithe",
        description: "Support the general ministry and operations",
        icon: Wallet,
        iconColor: "#C6FF00",
    },
    {
        id: "sonship-conference",
        title: "Sonship Conference",
        description: "Give toward this year's Sonship Conference",
        icon: Users,
        iconColor: "#7FD1FF",
    },
    {
        id: "building-planting",
        title: "Building Project & Planting",
        description: "Partner in our building and church planting projects",
        icon: Building2,
        iconColor: "#FFB84D",
    },
    {
        id: "prophets-seed",
        title: "The Prophet's Seed",
        description: "Sow a seed into the prophetic ministry",
        icon: Sprout,
        iconColor: "#8CE99A",
    },
    {
        id: "first-fruit",
        title: "First Fruit",
        description: "Honor God with your first fruit offering",
        icon: Apple,
        iconColor: "#FF8A7A",
    },
]