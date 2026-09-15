import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <View>
                <Text className="text-2xl font-bold">Inscription</Text>
            </View>
        </SafeAreaView>
    );
}