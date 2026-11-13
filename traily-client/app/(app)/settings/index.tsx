import { Link } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapModePicker } from "@/features/map";

// Placeholder: settings content (profile, visibility, logout) comes with its story.
// TODO(design): temporary text link style, to replace with the design system's list rows.
export default function SettingsScreen() {
    return (
        <SafeAreaView className="flex-1" edges={["bottom"]}>
            <View className="gap-4 p-6">
                <MapModePicker />
                <Link
                    href="/settings/credits"
                    className="text-base text-blue-600"
                >
                    Crédits
                </Link>
                <Link
                    href="/settings/onboarding"
                    className="text-base text-blue-600"
                >
                    Revoir l’onboarding
                </Link>
                <Link href="/login" replace className="text-base text-blue-600">
                    Se déconnecter
                </Link>
            </View>
        </SafeAreaView>
    );
}
