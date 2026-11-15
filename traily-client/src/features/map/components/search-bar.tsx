import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
    type TextStyle,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedReaction,
    useAnimatedStyle,
    type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
    GlassSurface,
    ON_GLASS,
    ON_GLASS_MUTED,
} from "@/components/glass-surface";
import { Icon } from "@/components/icon";

export const SEARCH_HEIGHT = 52;

// Not in React Native's style types, but react-native-web passes it through
// to drop the browser's focus ring.
const NO_WEB_OUTLINE = { outlineStyle: "none" } as unknown as TextStyle;

interface SearchBarProps {
    query: string;
    onChangeQuery: (query: string) => void;
    /** Whether the search panel is open. */
    open: boolean;
    /** 0 → 1 as the search panel opens. */
    openProgress: SharedValue<number>;
    onOpen: () => void;
    onClose: () => void;
    /** Every focus of the field, the panel open or not. */
    onFocus?: () => void;
    /** 0 → 1 as a panel opens over the results: hides the back arrow. */
    coverProgress?: SharedValue<number>;
}

/**
 * Glass search pill. Focusing it opens the search panel: the pill turns
 * into a white field on the panel and its magnifier into a back arrow that
 * closes the panel. A clear button fades in as soon as there is text.
 */
export function SearchBar({
    query,
    onChangeQuery,
    open,
    openProgress,
    onOpen,
    onClose,
    onFocus,
    coverProgress,
}: SearchBarProps) {
    const inputRef = useRef<TextInput>(null);

    const frostStyle = useAnimatedStyle(() => ({
        opacity: openProgress.get(),
    }));
    const searchIconStyle = useAnimatedStyle(() => ({
        opacity: 1 - openProgress.get(),
    }));
    const backIconStyle = useAnimatedStyle(() => {
        const cover = coverProgress?.get() ?? 0;
        return {
            opacity: openProgress.get() * (1 - cover),
            transform: [{ translateX: -8 * cover }, { scale: 1 - 0.3 * cover }],
        };
    });
    // The hidden arrow must not close the search under the finger.
    const [covered, setCovered] = useState(false);
    useAnimatedReaction(
        () => (coverProgress?.get() ?? 0) > 0.5,
        (isCovered, wasCovered) => {
            if (isCovered !== wasCovered) scheduleOnRN(setCovered, isCovered);
        },
    );

    function handleFocus() {
        onFocus?.();
        if (open) return;
        void Haptics.selectionAsync();
        onOpen();
    }

    function handleLeadingPress() {
        if (!open) {
            inputRef.current?.focus();
            return;
        }
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        inputRef.current?.blur();
        onClose();
    }

    function handleClear() {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChangeQuery("");
        inputRef.current?.focus();
    }

    return (
        <View style={styles.bar}>
            <GlassSurface style={[StyleSheet.absoluteFill, styles.round]} />
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.round,
                    styles.frost,
                    frostStyle,
                ]}
            />
            <Pressable
                onPress={handleLeadingPress}
                disabled={open && covered}
                accessibilityRole="button"
                accessibilityLabel={open ? "Fermer la recherche" : "Rechercher"}
                hitSlop={6}
                style={styles.leading}
            >
                <Animated.View style={[styles.leadingIcon, searchIconStyle]}>
                    <Icon
                        ios="magnifyingglass"
                        material="search"
                        size={22}
                        color={ON_GLASS_MUTED}
                    />
                </Animated.View>
                <Animated.View style={[styles.leadingIcon, backIconStyle]}>
                    <Icon
                        ios="chevron.left"
                        material="arrow_back"
                        size={22}
                        color={ON_GLASS}
                    />
                </Animated.View>
            </Pressable>
            <TextInput
                ref={inputRef}
                value={query}
                onChangeText={onChangeQuery}
                onFocus={handleFocus}
                placeholder="Rechercher un sentier, une espèce…"
                placeholderTextColor={ON_GLASS_MUTED}
                returnKeyType="search"
                style={[styles.input, NO_WEB_OUTLINE]}
            />
            {query.length > 0 && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(120)}
                >
                    <Pressable
                        onPress={handleClear}
                        accessibilityRole="button"
                        accessibilityLabel="Effacer la recherche"
                        hitSlop={8}
                        style={({ pressed }) => [
                            styles.clear,
                            { opacity: pressed ? 0.6 : 1 },
                        ]}
                    >
                        <Icon
                            ios="xmark"
                            material="close"
                            size={16}
                            color={ON_GLASS}
                        />
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        height: SEARCH_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 6,
        paddingRight: 10,
    },
    round: { borderRadius: SEARCH_HEIGHT / 2 },
    // Opaque white once the panel is open: the bar reads as a field on it.
    frost: { backgroundColor: "rgba(255, 255, 255, 0.92)" },
    leading: { width: 40, height: 40 },
    leadingIcon: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        // Already the default on native; on web, keeps the <input> painted
        // above the absolutely positioned glass instead of under it.
        position: "relative",
        flex: 1,
        height: "100%",
        marginLeft: 4,
        fontSize: 16,
        color: ON_GLASS,
    },
    clear: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(30, 30, 47, 0.08)",
    },
});
