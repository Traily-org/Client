import { StyleSheet, View } from "react-native";
import Animated, {
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CornerButton } from "./CornerButton";
import { GlassButton } from "./GlassButton";
import { ON_GLASS } from "./GlassSurface";
import { Icon } from "./Icon";
import { ENTER_DURATION, TRANSITION } from "./motion";
import { SearchBar } from "./SearchBar";

const SETTINGS_SIZE = 44;
const TOP_BAR_GAP = 10;

interface HomeOverlayProps {
    onSearch?: (query: string) => void;
    onOpenSettings?: () => void;
    onOpenTeam?: () => void;
    onOpenProfile?: () => void;
}

/**
 * Buttons laid over the home map: search bar and settings at the top, team
 * and profile in the bottom corners. The settings button steps aside while
 * searching so the bar can stretch. Lets touches through to the map
 * everywhere else.
 */
export function HomeOverlay({
    onSearch,
    onOpenSettings,
    onOpenTeam,
    onOpenProfile,
}: HomeOverlayProps) {
    const insets = useSafeAreaInsets();
    const searchFocus = useSharedValue(0);
    const gearRotation = useSharedValue(0);

    const settingsSlotStyle = useAnimatedStyle(() => {
        const focus = searchFocus.get();
        return {
            width: interpolate(focus, [0, 1], [SETTINGS_SIZE, 0]),
            marginLeft: interpolate(focus, [0, 1], [TOP_BAR_GAP, 0]),
            opacity: interpolate(focus, [0, 0.5], [1, 0], "clamp"),
        };
    });
    const gearStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${gearRotation.get()}deg` }],
    }));

    function handleOpenSettings() {
        gearRotation.set(withTiming(gearRotation.get() + 60, TRANSITION));
        onOpenSettings?.();
    }

    return (
        <View style={styles.overlay}>
            <Animated.View
                entering={FadeInUp.duration(ENTER_DURATION)}
                style={[styles.topBar, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.searchSlot}>
                    <SearchBar
                        focusProgress={searchFocus}
                        onSearch={onSearch}
                    />
                </View>
                <Animated.View style={settingsSlotStyle}>
                    <GlassButton
                        accessibilityLabel="Paramètres"
                        radius={SETTINGS_SIZE / 2}
                        pressedScale={0.9}
                        onPress={handleOpenSettings}
                        style={styles.settings}
                    >
                        <Animated.View style={gearStyle}>
                            <Icon
                                ios="gearshape.fill"
                                material="settings"
                                size={22}
                                color={ON_GLASS}
                            />
                        </Animated.View>
                    </GlassButton>
                </Animated.View>
            </Animated.View>

            <CornerButton
                corner="left"
                label="Équipe"
                enterDelay={80}
                onPress={onOpenTeam}
                icon={
                    <Icon
                        ios="person.2.fill"
                        material="group"
                        size={30}
                        color={ON_GLASS}
                    />
                }
            />
            <CornerButton
                corner="right"
                label="Profil"
                enterDelay={140}
                onPress={onOpenProfile}
                icon={
                    <Icon
                        ios="face.smiling"
                        material="sentiment_satisfied"
                        size={30}
                        color={ON_GLASS}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        pointerEvents: "box-none",
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    searchSlot: { flex: 1 },
    settings: {
        width: SETTINGS_SIZE,
        height: SETTINGS_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
});
