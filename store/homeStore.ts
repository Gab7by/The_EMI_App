import { homeProfileModalType } from "@/types/profile-types";
import { create } from "zustand";

export const useHomeProfileModalStore = create<homeProfileModalType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)