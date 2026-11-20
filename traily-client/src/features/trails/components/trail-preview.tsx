import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { ENTER_DURATION } from "@/constants/motion";
import { withAlpha } from "@/constants/theme-colors";
import { useThemeColors } from "@/hooks/use-theme-colors";

import { useTrailDetails } from "../hooks/use-trail-details";
import { TrailCard } from "./trail-card";

const GAP = 12;
const CLOSE_SIZE = 30;

interface TrailPreviewProps {
    /** Trail to preview; nothing shows without one. */
    trailId?: string;
    /** Height of the map's corner buttons, which the preview sits above. */
    cornerButtonSize: number;
    /** Touching the card, e.g. to open the trail sheet. */
    onOpen: (trailId: string) => void;
    onClose: () => void;
}

/**
 * Card of the focused trail, floating above the map's corner buttons: the
 * same card as in the search results, with a close button on its corner.
 * Slides in and out; changing trail swaps the card.
 */
export function TrailPreview({
    trailId,
    cornerButtonSize,
    onOpen,
    onClose,
}: TrailPreviewProps) {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const trail = useTrailDetails(trailId ?? "");

    return (
        <View
            style={[
                styles.container,
                { bottom: insets.bottom + cornerButtonSize + GAP },
            ]}
        >
            {trail && (
                <Animated.View
                    key={trail.id}
                    entering={FadeInDown.duration(ENTER_DURATION)}
                    exiting={FadeOutDown.duration(ENTER_DURATION / 2)}
                    style={[
                        styles.card,
                        {
                            boxShadow: `0px 6px 22px ${withAlpha(colors.shadow, 0.22)}`,
                        },
                    ]}
                >
                    <TrailCard trail={trail} onPress={() => onOpen(trail.id)} />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Fermer l'aperçu"
                        hitSlop={10}
                        onPress={onClose}
                        style={[
                            styles.close,
                            {
                                backgroundColor: colors.surface,
                                boxShadow: `0px 2px 6px ${withAlpha(colors.shadow, 0.25)}`,
                            },
                        ]}
                    >
                        <Icon
                            ios="xmark"
                            material="close"
                            size={14}
                            color={colors.foreground}
                        />
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Full width but lets touches through to the map around the card.
    container: {
        position: "absolute",
        left: 16,
        right: 16,
        pointerEvents: "box-none",
    },
    card: { borderRadius: 22 },
    close: {
        position: "absolute",
        top: -CLOSE_SIZE / 3,
        right: -CLOSE_SIZE / 3,
        width: CLOSE_SIZE,
        height: CLOSE_SIZE,
        borderRadius: CLOSE_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
    },
});
