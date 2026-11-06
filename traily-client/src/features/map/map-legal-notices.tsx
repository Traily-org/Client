import { Image } from "expo-image";
import { Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAP_ATTRIBUTIONS, MAPTILER_HOME_URL } from "./style/map-styles";

const MAPTILER_LOGO = require("./assets/maptiler-logo.svg");

/**
 * MapTiler's legal notices, laid out as their docs recommend: the logo
 * (linking to maptiler.com) bottom-left, the text attribution bottom-right
 * — under MapModeSwitcher. Rendered by the app rather than MapLibre, whose
 * attribution collapses behind an "i" button while the terms require it to
 * stay visible and readable. Shared by the native and web maps.
 */
export function MapLegalNotices() {
    const insets = useSafeAreaInsets();

    return (
        <>
            <Pressable
                onPress={() => Linking.openURL(MAPTILER_HOME_URL)}
                accessibilityRole="link"
                accessibilityLabel="MapTiler logo"
                className="absolute left-2"
                style={{ bottom: insets.bottom + 8 }}
            >
                <Image
                    source={MAPTILER_LOGO}
                    style={{ width: 67, height: 20 }}
                    contentFit="contain"
                />
            </Pressable>
            <View
                className="absolute right-1 rounded bg-white/80 px-1"
                style={{ bottom: insets.bottom + 2 }}
            >
                <Text className="text-[10px] text-[#333]">
                    {MAP_ATTRIBUTIONS.map((attribution, index) => (
                        <Text
                            key={attribution.url}
                            onPress={() => Linking.openURL(attribution.url)}
                            accessibilityRole="link"
                        >
                            {index > 0 ? " " : ""}
                            {attribution.label}
                        </Text>
                    ))}
                </Text>
            </View>
        </>
    );
}
