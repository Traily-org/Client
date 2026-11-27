import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { withAlpha } from "@/constants/theme-colors";
import { usePressed } from "@/hooks/use-pressed";
import { useThemeColors } from "@/hooks/use-theme-colors";

import { useFavoriteTrail } from "../hooks/use-favorite-trail";
import { useTrailDetails } from "../hooks/use-trail-details";
import type { TrailDetails } from "../types";
import {
    SelectTrailButton,
    type TrailSelectState,
} from "./select-trail-button";
import { TrailDetailsBody } from "./trail-details-body";
import { TrailFavoriteButton } from "./trail-favorite-button";

const BUTTON_SIZE = 40;
const BUTTON_TOP = 16;
const SELECT_HEIGHT = 52;

interface TrailSheetContentProps {
    trailId: string;
    onClose: () => void;
    /** Shows the "Choisir" button, floating at the bottom. */
    onSelect?: (trail: TrailDetails) => void;
    selectState?: TrailSelectState;
    /** False while the sheet is still opening: the map starts afterwards. */
    mapReady?: boolean;
}

/**
 * White sheet body scrolling under floating buttons: favorite star top
 * left, close cross top right, and the optional "Choisir" button at the
 * bottom. Shared by the search panel and the trail screen.
 */
export function TrailSheetContent({
    trailId,
    onClose,
    onSelect,
    selectState = "available",
    mapReady = true,
}: TrailSheetContentProps) {
    const insets = useSafeAreaInsets();
    const trail = useTrailDetails(trailId);
    const { isFavorite, toggleFavorite } = useFavoriteTrail(trailId);
    const selectBottom = insets.bottom + 12;
    const showSelect = trail !== undefined && onSelect !== undefined;
    const colors = useThemeColors();
    const closePress = usePressed();
    const floatingColors = {
        backgroundColor: colors.surface,
        boxShadow: `0px 2px 10px ${withAlpha(colors.shadow, 0.16)}`,
    };

    return (
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: showSelect
                            ? selectBottom + SELECT_HEIGHT + 24
                            : insets.bottom + 24,
                    },
                ]}
            >
                {trail ? (
                    <TrailDetailsBody trail={trail} showMap={mapReady} />
                ) : (
                    <Text
                        style={[
                            styles.missing,
                            { color: colors["foreground-muted"] },
                        ]}
                    >
                        Sentier introuvable.
                    </Text>
                )}
            </ScrollView>

            {trail && (
                <TrailFavoriteButton
                    isFavorite={isFavorite}
                    onPress={toggleFavorite}
                    style={[styles.floating, floatingColors, styles.left]}
                />
            )}
            <Pressable
                onPress={onClose}
                {...closePress.pressHandlers}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={6}
                style={[
                    styles.floating,
                    floatingColors,
                    styles.right,
                    closePress.pressed && styles.pressed,
                ]}
            >
                <Icon
                    ios="xmark"
                    material="close"
                    size={16}
                    color={colors.foreground}
                />
            </Pressable>

            {showSelect && (
                <View
                    style={[
                        styles.select,
                        {
                            bottom: selectBottom,
                            boxShadow: `0px 6px 18px ${withAlpha(colors.shadow, 0.22)}`,
                        },
                    ]}
                >
                    <SelectTrailButton
                        state={selectState}
                        onPress={() => onSelect(trail)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: { flex: 1 },
    content: {
        paddingTop: BUTTON_TOP + BUTTON_SIZE + 12,
        paddingHorizontal: 16,
    },
    missing: {
        marginTop: 48,
        textAlign: "center",
        fontSize: 15,
    },
    // Round buttons hovering over the text as it scrolls under them.
    floating: {
        position: "absolute",
        top: BUTTON_TOP,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
    },
    left: { left: 16 },
    right: { right: 16 },
    pressed: { opacity: 0.6 },
    select: {
        position: "absolute",
        left: 16,
        right: 16,
        borderRadius: SELECT_HEIGHT / 2,
    },
});
