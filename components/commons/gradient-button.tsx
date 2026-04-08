import { GradientButtonProps } from "@/types/ui-commons-props";
import { Pressable, Text } from "react-native";
import {LinearGradient} from "expo-linear-gradient"

const GradientButton = ({colors, text, end, start, textColor}: GradientButtonProps) => {
    return (
        <Pressable className="w-full">
            <LinearGradient
                colors={colors}
                start={start}
                end={end}
                className="rounded-xl"
            >
                <Text className="font-bold" style={{color: textColor}}>
                    {text}
                </Text>
            </LinearGradient>
        </Pressable>
    )
}

export default GradientButton