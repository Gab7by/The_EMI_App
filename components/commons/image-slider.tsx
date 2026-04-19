import { SliderProps } from "@/types/ui-commons-props"
import { Image } from "expo-image"
import { useCallback, useEffect, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native"
import { SlideInLeft } from "react-native-reanimated"

const ImageSlider = ({items, height = 200}:SliderProps) => {

    const [activeIndex, setActiveIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)

    const scrollRef = useRef<ScrollView>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const handleLayout = useCallback(({nativeEvent}:{nativeEvent: {layout: {width: number}}}) => {
        setSliderWidth(nativeEvent.layout.width)
    }, [])

    const scrollToINdex = useCallback((index: number) => {
        scrollRef.current?.scrollTo({
            x: index * sliderWidth,
            animated: true
        })
        
        setActiveIndex(index)
    }, [sliderWidth])

    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        intervalRef.current = setInterval(() => {
            setActiveIndex((current) => {
            const nextIndex = current === items.length - 1 ? 0 : current + 1
            scrollRef.current?.scrollTo({
                x: nextIndex * sliderWidth,
                animated: true
            })
            return nextIndex
        })
        }, 3000)
    }, [sliderWidth, items.length])

    const stopAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!sliderWidth) return

        const scrollPosition = event.nativeEvent.contentOffset.x

        const index = Math.round(scrollPosition / sliderWidth)

        setActiveIndex(index)
    }, [sliderWidth])

    useEffect(() => {
        if (!sliderWidth) return;

        startAutoPlay();

        return () => stopAutoPlay();
        }, [sliderWidth, startAutoPlay, stopAutoPlay])

    return (
        <View className="gap-3">
            <View className="rounded-3xl overflow-hidden">
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onLayout={handleLayout}
                    onScrollBeginDrag={stopAutoPlay}
                    onMomentumScrollEnd={startAutoPlay}
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