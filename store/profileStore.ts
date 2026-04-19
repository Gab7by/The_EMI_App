import { ProfileIconStoreType } from "@/types/profile-types";
import { create } from "zustand";

export const useProfileStore = create<ProfileIconStoreType>(
    (set, get) => ({
        profileImageUrl: null
    })
)