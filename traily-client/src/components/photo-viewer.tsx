import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "./icon";

export interface ViewedPhoto {
    url: string;
    /** What the photo shows, under it. */
    caption?: string;
    /** Author and license, when the photo requires a credit. */
    credit?: string;
}

interface PhotoViewerProps {
    /** Photo to show full screen, null when closed. */
    photo: ViewedPhoto | null;
    onClose: () => void;
}

/**
 * Full-screen preview of a photo on a dark background, with its caption
 * and credit. Touching anywhere, the cross or the back button closes it.
 */
export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
    const insets = useSafeAreaInsets();
    // Keeps the last photo on screen while the modal fades out.
    const [shown, setShown] = useState(photo);
    if (photo && photo !== shown) setShown(photo);

    return (
        <Modal
            visible={photo !== null}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer l’aperçu"
                style={styles.backdrop}
            >
                {shown && (
                    <Image
                        source={{ uri: shown.url }}
                        style={styles.photo}
                        contentFit="contain"
                        transition={150}
                        accessibilityLabel={shown.caption}
                    />
                )}
            </Pressable>
            {shown && (shown.caption || shown.credit) && (
                <View
                    style={[
                        styles.legend,
                        { paddingBottom: insets.bottom + 20 },
                    ]}
                    pointerEvents="none"
                >
                    {shown.caption && (
                        <Text style={styles.caption}>{shown.caption}</Text>
                    )}
                    {shown.credit && (
                        <Text style={styles.credit}>{shown.credit}</Text>
                    )}
                </View>
            )}
            <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={8}
                style={[styles.close, { top: insets.top + 12 }]}
            >
                <Icon ios="xmark" material="close" size={18} color="#FFFFFF" />
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(8, 8, 14, 0.94)",
    },
    photo: { width: "100%", height: "75%" },
    legend: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        gap: 4,
    },
    caption: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
    credit: { fontSize: 12, color: "rgba(255, 255, 255, 0.6)" },
    close: {
        position: "absolute",
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.16)",
    },
});
