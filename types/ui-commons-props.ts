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
    source: number
}

export type SliderProps = {
    items: SliderItem[]
    height?: number
}
