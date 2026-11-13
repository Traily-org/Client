import { useRouter } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { BackHandler, Keyboard, StyleSheet, View } from "react-native";
import Animated, {
    FadeInUp,
    type SharedValue,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassButton } from "@/components/glass-button";
import { ON_GLASS } from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import {
    ENTER_DURATION,
    SHEET_CLOSE,
    SHEET_OPEN,
    TRANSITION,
} from "@/constants/motion";

import { CornerButton } from "./corner-button";
import { SEARCH_HEIGHT, SearchBar } from "./search-bar";
import { SearchPanel } from "./search-panel";

const SETTINGS_SIZE = 44;
const TOP_BAR_GAP = 10;
const TOP_BAR_MARGIN = 12;

/** What the search results need to know about the search. */
export interface SearchResultsContext {
    query: string;
    /** Lets a result close the panel once picked. */
    closeSearch: () => void;
    /** Bumped each time the search field gains focus. */
    focusCount: number;
    /**
     * For a panel the results open over the search (0 to 1, how far it is
     * open): fades the search bar's back arrow out in step.
     */
    coverProgress: SharedValue<number>;
}

interface MapControlsProps {
    /**
     * Content of the search panel. Passed in by the route, so the map
     * feature doesn't depend on the features it searches.
     */
    renderSearchResults?: (search: SearchResultsContext) => ReactNode;
    /**
     * Shown top-left under the search bar, covered by the search panel. Its
     * container fills the screen (letting touches through), so it can lay a
     * full-screen layer behind itself, e.g. to close on a tap outside.
     */
    belowSearch?: ReactNode;
}

/**
 * Controls laid over the home map: search bar and settings at the top, team
 * and profile in the bottom corners. Focusing the search bar raises a
 * full-screen search panel that merges with the bar, while the settings
 * button steps aside. Lets touches through to the map everywhere else.
 */
export function MapControls({
    renderSearchResults,
    belowSearch,
}: MapControlsProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    // Bumped on each opening so the results remount and cascade in again.
    const [openCount, setOpenCount] = useState(0);
    const [focusCount, setFocusCount] = useState(0);
    const searchProgress = useSharedValue(0);
    const coverProgress = useSharedValue(0);
    const gearRotation = useSharedValue(0);

    const topBarHeight = insets.top + TOP_BAR_MARGIN + SEARCH_HEIGHT;

    const settingsSlotStyle = useAnimatedStyle(() => {
        const p = searchProgress.get();
        return {
            width: interpolate(p, [0, 1], [SETTINGS_SIZE, 0]),
            marginLeft: interpolate(p, [0, 1], [TOP_BAR_GAP, 0]),
            opacity: interpolate(p, [0, 0.4], [1, 0], "clamp"),
        };
    });
    const gearStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${gearRotation.get()}deg` }],
    }));

    function openSearch() {
        setSearchOpen(true);
        setOpenCount((count) => count + 1);
        searchProgress.set(withTiming(1, SHEET_OPEN));
    }

    function closeSearch() {
        Keyboard.dismiss();
        setSearchOpen(false);
        searchProgress.set(withTiming(0, SHEET_CLOSE));
    }

    // Android back button closes the panel instead of leaving the screen.
    useEffect(() => {
        if (!searchOpen) return;
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                Keyboard.dismiss();
                setSearchOpen(false);
                searchProgress.set(withTiming(0, SHEET_CLOSE));
                return true;
            },
        );
        return () => subscription.remove();
    }, [searchOpen, searchProgress]);

    function handleOpenSettings() {
        gearRotation.set(withTiming(gearRotation.get() + 60, TRANSITION));
        router.push("/settings");
    }

    return (
        <View style={styles.overlay}>
            <CornerButton
                corner="left"
                label="Équipe"
                enterDelay={80}
                onPress={() => router.push("/team")}
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
                onPress={() => router.push("/profile")}
                icon={
                    <Icon
                        ios="face.smiling"
                        material="sentiment_satisfied"
                        size={30}
                        color={ON_GLASS}
                    />
                }
            />

            {/* Before the search panel, which covers it when open. */}
            <View
                style={[
                    styles.belowSearch,
                    { paddingTop: topBarHeight + TOP_BAR_GAP },
                ]}
            >
                {belowSearch}
            </View>

            <SearchPanel
                progress={searchProgress}
                contentTop={topBarHeight + TOP_BAR_MARGIN}
            >
                {/* Mounted from the first opening on, so it stays visible
                    while the panel slides back down. */}
                {openCount > 0 && (
                    <View key={openCount} style={styles.searchResults}>
                        {renderSearchResults?.({
                            query,
                            closeSearch,
                            focusCount,
                            coverProgress,
                        })}
                    </View>
                )}
            </SearchPanel>

            <Animated.View
                entering={FadeInUp.duration(ENTER_DURATION)}
                style={[
                    styles.topBar,
                    { paddingTop: insets.top + TOP_BAR_MARGIN },
                ]}
            >
                <View style={styles.searchSlot}>
                    <SearchBar
                        query={query}
                        onChangeQuery={setQuery}
                        open={searchOpen}
                        openProgress={searchProgress}
                        onOpen={openSearch}
                        onClose={closeSearch}
                        onFocus={() => setFocusCount((count) => count + 1)}
                        coverProgress={coverProgress}
                    />
                </View>
                {/* Clips the button as the slot shrinks: otherwise it sticks
                    out on the right and widens the page on the web. */}
                <Animated.View style={[styles.settingsSlot, settingsSlotStyle]}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        pointerEvents: "box-none",
    },
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    belowSearch: {
        ...StyleSheet.absoluteFill,
        paddingHorizontal: 16,
        alignItems: "flex-start",
        pointerEvents: "box-none",
    },
    searchSlot: { flex: 1 },
    settingsSlot: { overflow: "hidden" },
    searchResults: { flex: 1 },
    settings: {
        width: SETTINGS_SIZE,
        height: SETTINGS_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
});
