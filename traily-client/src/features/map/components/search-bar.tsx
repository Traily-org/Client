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
    useAnimatedStyle,
    withTiming,
    type SharedValue,
} from "react-native-reanimated";

import {
    GlassSurface,
    ON_GLASS,
    ON_GLASS_MUTED,
} from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import { TRANSITION } from "@/constants/motion";

export const SEARCH_HEIGHT = 52;

// Not in React Native's style types, but react-native-web passes it through
// to drop the browser's focus ring.
const NO_WEB_OUTLINE = { outlineStyle: "none" } as unknown as TextStyle;

interface SearchBarProps {
    /** 0 → 1 while the input has focus; driven here, read by the overlay. */
    focusProgress: SharedValue<number>;
    onSearch?: (query: string) => void;
}

/**
 * Glass search pill. Turns more opaque while focused; a clear button fades
 * in as soon as there is text.
 */
export function SearchBar({ focusProgress, onSearch }: SearchBarProps) {
    const inputRef = useRef<TextInput>(null);
    const [query, setQuery] = useState("");

    const frostStyle = useAnimatedStyle(() => ({
        opacity: focusProgress.get(),
    }));

    function handleFocus() {
        void Haptics.selectionAsync();
        focusProgress.set(withTiming(1, TRANSITION));
    }

    function handleBlur() {
        focusProgress.set(withTiming(0, TRANSITION));
    }

    function handleClear() {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuery("");
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
            <Icon
                ios="magnifyingglass"
                material="search"
                size={22}
                color={ON_GLASS_MUTED}
            />
            <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSubmitEditing={() => onSearch?.(query.trim())}
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
        paddingLeft: 16,
        paddingRight: 10,
    },
    round: { borderRadius: SEARCH_HEIGHT / 2 },
    frost: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
    input: {
        // Already the default on native; on web, keeps the <input> painted
        // above the absolutely positioned glass instead of under it.
        position: "relative",
        flex: 1,
        height: "100%",
        marginLeft: 10,
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
