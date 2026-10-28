import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { session } from "@/features/auth";
import { useSessionStore } from "@/store/session";

export default function HomeScreen() {
    const user = useSessionStore((s) => s.user);
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <View className="items-center">
                <Text className="text-2xl font-bold">Bienvenue sur Traily</Text>
                <Text className="mt-2">
                    {user?.displayName ?? user?.username ?? user?.email}
                </Text>
                <Link href="/map" className="mt-4 text-center text-blue-600">
                    Voir la carte
                </Link>
                <Link
                    href="/credits"
                    className="mt-2 text-center text-blue-600"
                >
                    Crédits
                </Link>
                <Pressable
                    accessibilityRole="button"
                    onPress={session.logout}
                    className="mt-6 min-h-12 justify-center px-4"
                >
                    <Text className="text-blue-600">Se déconnecter</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
