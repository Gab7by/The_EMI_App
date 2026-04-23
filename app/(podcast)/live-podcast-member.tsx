import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const MemberLivePodcast = () => {
    return (
        <SafeAreaView className="bg-menorah-bg flex-1 items-center justify-center">
            <Text className="text-menorah-primary text-4xl">We are Live</Text>
            <Text className="text-menorah-primary text-4xl">Member</Text>
        </SafeAreaView>
    )
}

export default MemberLivePodcast