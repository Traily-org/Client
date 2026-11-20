import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { PhotoViewer, type ViewedPhoto } from "@/components/photo-viewer";
import { mapOverlayColors } from "@/constants/theme-colors";
import { type PhotoPin, TrailRouteMap } from "@/features/map";
import { useThemeColors } from "@/hooks/use-theme-colors";

import { formatDistance, formatDuration } from "../services/trail-format";
import type { PointOfInterest, TrailDetails } from "../types";
import { PointOfInterestCard } from "./point-of-interest-card";
import { TrailCreatorLink } from "./trail-creator-link";
import { DIFFICULTY } from "./trail-difficulty";

/** Points of interest listed in the sheet; the map shows them all. */
const LISTED_POINTS = 3;

/**
 * Body of the trail sheet: cover, key figures, description, creator, first
 * points of interest, then the route on a map with the points of interest
 * pinned along it.
 */
export function TrailDetailsBody({
    trail,
    showMap = true,
}: {
    trail: TrailDetails;
    /** False keeps an empty frame in place of the map, which is heavy to start. */
    showMap?: boolean;
}) {
    const router = useRouter();
    const [viewedPhoto, setViewedPhoto] = useState<ViewedPhoto | null>(null);
    const difficulty = DIFFICULTY[trail.difficulty];
    const colors = useThemeColors();

    function viewPoint(point: PointOfInterest) {
        setViewedPhoto({
            url: point.photo.url,
            caption: point.title,
            credit: point.photo.credit,
        });
    }
    const pins: PhotoPin[] = trail.pointsOfInterest.map((point) => ({
        id: point.id,
        lngLat: point.lngLat,
        photoUrl: point.photo.url,
        label: point.title,
    }));
    const credits = [
        ...new Set(
            [trail.cover, ...trail.pointsOfInterest.map((p) => p.photo)]
                .map((photo) => photo.credit)
                .filter((credit) => credit !== undefined),
        ),
    ];

    return (
        <View style={styles.body}>
            <View style={styles.summary}>
                <Pressable
                    onPress={() =>
                        setViewedPhoto({
                            url: trail.cover.url,
                            caption: trail.name,
                            credit: trail.cover.credit,
                        })
                    }
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`Agrandir la photo : ${trail.name}`}
                    style={({ pressed }) => [
                        styles.cover,
                        { backgroundColor: colors[difficulty.tint] },
                        pressed && styles.pressed,
                    ]}
                >
                    <Image
                        source={{ uri: trail.cover.url }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={200}
                    />
                </Pressable>
                <View style={styles.summaryText}>
                    <Text
                        style={[styles.name, { color: colors.foreground }]}
                        accessibilityRole="header"
                    >
                        {trail.name}
                    </Text>
                    <Text
                        style={[
                            styles.location,
                            { color: colors["foreground-muted"] },
                        ]}
                    >
                        {trail.location}
                        <Text style={{ color: colors[difficulty.color] }}>
                            {"  ·  "}
                            {difficulty.label}
                        </Text>
                    </Text>
                    <View style={styles.figures}>
                        <Figure
                            ios="point.topleft.down.to.point.bottomright.curvepath"
                            material="route"
                            text={formatDistance(trail.distanceKm)}
                        />
                        <Figure
                            ios="arrow.up.right"
                            material="trending_up"
                            text={`${trail.elevationGainM} m D+`}
                        />
                        <Figure
                            ios="clock"
                            material="schedule"
                            text={formatDuration(trail.durationMin)}
                        />
                    </View>
                </View>
            </View>

            <Text style={[styles.description, { color: colors.foreground }]}>
                {trail.description}
            </Text>

            <TrailCreatorLink
                creator={trail.creator}
                onPress={() =>
                    router.push({
                        pathname: "/user/[userId]",
                        params: { userId: trail.creator.id },
                    })
                }
            />

            {trail.pointsOfInterest.length > 0 && (
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.foreground },
                        ]}
                    >
                        Points d’intérêt
                    </Text>
                    {trail.pointsOfInterest
                        .slice(0, LISTED_POINTS)
                        .map((point) => (
                            <PointOfInterestCard
                                key={point.id}
                                point={point}
                                onPressPhoto={() => viewPoint(point)}
                            />
                        ))}
                </View>
            )}

            <View
                style={[styles.divider, { backgroundColor: colors.separator }]}
            />

            <View style={styles.section}>
                <Text
                    style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                    Tracé
                </Text>
                <View
                    style={[
                        styles.map,
                        { backgroundColor: colors.placeholder },
                    ]}
                >
                    {showMap && (
                        <TrailRouteMap
                            route={trail.route}
                            color={mapOverlayColors[difficulty.route]}
                            pins={pins}
                            onPressPin={(pinId) => {
                                const point = trail.pointsOfInterest.find(
                                    (candidate) => candidate.id === pinId,
                                );
                                if (point) viewPoint(point);
                            }}
                        />
                    )}
                </View>
            </View>

            {credits.length > 0 && (
                <Text
                    style={[
                        styles.credits,
                        { color: colors["foreground-muted"] },
                    ]}
                >
                    Photos : {credits.join(" · ")}
                </Text>
            )}

            <PhotoViewer
                photo={viewedPhoto}
                onClose={() => setViewedPhoto(null)}
            />
        </View>
    );
}

interface FigureProps {
    ios: Parameters<typeof Icon>[0]["ios"];
    material: Parameters<typeof Icon>[0]["material"];
    text: string;
}

function Figure({ ios, material, text }: FigureProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.figure}>
            <Icon
                ios={ios}
                material={material}
                size={14}
                color={colors["foreground-muted"]}
            />
            <Text style={[styles.figureText, { color: colors.foreground }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    body: { gap: 18 },
    summary: { flexDirection: "row", gap: 14 },
    pressed: { opacity: 0.8 },
    cover: {
        width: 128,
        height: 128,
        borderRadius: 18,
        overflow: "hidden",
    },
    summaryText: { flex: 1, gap: 6 },
    name: { fontSize: 18, fontWeight: "700", lineHeight: 23 },
    location: { fontSize: 13 },
    figures: { gap: 4, marginTop: 2 },
    figure: { flexDirection: "row", alignItems: "center", gap: 6 },
    figureText: { fontSize: 13 },
    description: { fontSize: 14, lineHeight: 21 },
    section: { gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "700" },
    divider: {
        height: StyleSheet.hairlineWidth,
    },
    map: {
        height: 240,
        borderRadius: 18,
        overflow: "hidden",
    },
    credits: { fontSize: 11, lineHeight: 15 },
});
