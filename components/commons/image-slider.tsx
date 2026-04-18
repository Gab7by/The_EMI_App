import { SliderProps } from "@/types/ui-commons-props"
import { Image } from "expo-image"
import { useCallback, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native"

const ImageSlider = ({items, height = 200}:SliderProps) => {

    const [activeIndex, setActiveIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)

    const scrollRef = useRef<ScrollView>(null)

    const handleLayout = useCallback(({nativeEvent}:{nativeEvent: {layout: {width: number}}}) => {
        setSliderWidth(nativeEvent.layout.width)
    }, [])

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!sliderWidth) return

        const scrollPosition = event.nativeEvent.contentOffset.x

        const index = Math.round(scrollPosition / sliderWidth)

        setActiveIndex(index)
    }, [sliderWidth])

    return (
        <View className="gap-3">
            <View className="rounded-3xl overflow-hidden">
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onLayout={handleLayout}
                    ref={scrollRef}
                    pagingEnabled
                    horizontal
                    scrollEventThrottle={16}
                    style={{height}}
                    className="w-full"
                >
                    {
                        items.map((item) => (
                            <Image
                                key={item.id}
                                source={item.source}
                                contentFit="cover"
                                style={{height, width: sliderWidth}}
                            />
                        ))
                    }
                </ScrollView>
            </View>
            <View className="flex-row justify-center items-center gap-2">
                {items.map((_, index) => (
                    <View
                        key={index}
                        className={
                            `rounded-full transition-all ${
                            index === activeIndex
                                ? 'w-4 h-2 bg-menorah-primary'      
                                : 'w-2 h-2 bg-menorah-primary/40'
                            }`
                        }
                    />
                ))}
            </View>
        </View>
    )
}

export default ImageSlider