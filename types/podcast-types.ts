export type liveStreamStartModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamStartDialogModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamInfoModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type liveStreamVisibilityModalType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export type LiveStreamVisibilityOptionsType = {
    isPublic: boolean
    setIsPublic: React.Dispatch<React.SetStateAction<boolean>>
    isUnlisted: boolean
    setIsUnlisted: React.Dispatch<React.SetStateAction<boolean>>
}

export type LiveStreamInfoType = {
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    about: string
    setAbout: React.Dispatch<React.SetStateAction<string>>
}
