import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <View>
                <Text className="text-2xl font-bold">Bienvenue sur Traily</Text>
                <Link href="/map" className="mt-4 text-center text-blue-600">
                    Voir la carte
                </Link>
                <Link
                    href="/credits"
                    className="mt-2 text-center text-blue-600"
                >
                    Crédits
                </Link>
            </View>
        </SafeAreaView>
    );
}
