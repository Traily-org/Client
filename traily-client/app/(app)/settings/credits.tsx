import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllAttributions } from "@/features/map";

export default function CreditsScreen() {
    const attributions = getAllAttributions();

    return (
        <SafeAreaView className="flex-1" edges={["bottom"]}>
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-4 p-6"
            >
                <Text className="text-base text-gray-600">
                    Traily s’appuie sur des fonds de carte et des données
                    fournis par :
                </Text>
                {attributions.map((attribution) => (
                    <Text key={attribution} className="text-sm text-gray-800">
                        {attribution}
                    </Text>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
