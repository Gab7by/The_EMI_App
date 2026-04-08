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

