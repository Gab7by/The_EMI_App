import { liveStreamStartDialogModalType, liveStreamStartModalType } from "@/types/podcast-types";
import { create } from "zustand";

export const useLiveStreamStartModalStore = create<liveStreamStartModalType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)

export const useLiveStreamStartDialogModalStore = create<liveStreamStartDialogModalType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)