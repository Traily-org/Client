import { type Href, Link, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Temporary link from a placeholder screen to the next screen of the flow. */
export interface PlaceholderLink {
    label: string;
    href: Href;
    /** Go back to `href` when it is already in the history, instead of pushing it again. */
    dismissTo?: boolean;
}

interface PlaceholderScreenProps {
    /** Screen name shown to the user, as in the navigation map. */
    title: string;
    /** Backlog story the screen belongs to, e.g. "3.3". */
    story: string;
    /** Transitions of the navigation map available from this screen. */
    links?: PlaceholderLink[];
}

/**
 * Temporary scaffold for a route whose screen is not built yet. Each route
 * replaces it with the real screen from its feature.
 */
export function PlaceholderScreen({
    title,
    story,
    links = [],
}: PlaceholderScreenProps) {
    return (
        <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
            <Stack.Screen options={{ title }} />
            <View className="flex-1 items-center justify-center gap-8 p-6">
                <View className="items-center gap-2">
                    <Text className="text-2xl font-bold">{title}</Text>
                    <Text className="text-sm text-gray-500">
                        Écran à venir · story {story}
                    </Text>
                </View>
                {/* TODO(design): temporary buttons to walk through the navigation map. */}
                {links.length > 0 && (
                    <View className="w-full max-w-xs gap-3">
                        {links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                dismissTo={link.dismissTo}
                                asChild
                            >
                                <Pressable className="rounded-xl bg-[#e0733f] px-4 py-3">
                                    <Text className="text-center font-semibold text-white">
                                        {link.label}
                                    </Text>
                                </Pressable>
                            </Link>
                        ))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
