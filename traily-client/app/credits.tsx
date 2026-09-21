import { Link } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllAttributions } from "@/features/map";

export default function CreditsScreen() {
    const attributions = getAllAttributions();

    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-4 p-6"
            >
                <Text className="text-2xl font-bold">Crédits</Text>
                <Text className="text-base text-gray-600">
                    Traily s'appuie sur des fonds de carte et des données
                    fournis par :
                </Text>
                {attributions.map((attribution) => (
                    <Text key={attribution} className="text-sm text-gray-800">
                        {attribution}
                    </Text>
                ))}
                <Link href="/" className="mt-4 text-blue-600">
                    Retour
                </Link>
            </ScrollView>
        </SafeAreaView>
    );
}
