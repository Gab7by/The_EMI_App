import { ColorValue } from "react-native"

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

type GradientDirection = {
    x: number
    y: number
}

export type GradientButtonProps = {
    colors: GradientColors
    text: string
    textColor?: ColorValue
    start?: GradientDirection
    end?: GradientDirection
}

export type SliderItem = {
    id: string
    // A bundled asset (require()'d, a number) or a remote image ({ uri }).
    source: number | { uri: string }
    // Only meaningful when `source` is a remote { uri } - the bundled asset
    // to swap in if that URI fails to load, so one broken upload only ever
    // loses its own slide instead of breaking the whole slider.
    fallbackSource?: number
}

export type SliderProps = {
    items: SliderItem[]
    height?: number
}
