import { LucideProps } from "lucide-react-native"

export type ProfileIconStoreType = {
    profileImageUrl: string | null
}

export type homeProfileModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type profileManagementCategory = {
    key: string
    icon: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>
    categoryName: string
    categoryDescription?: string
    categoryIconColor?: string
    onPressFunction?: () => void
}