import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { PhotoViewer, type ViewedPhoto } from "@/components/photo-viewer";
import { type PhotoPin, TrailRouteMap } from "@/features/map";

import { formatDistance, formatDuration } from "../services/trail-format";
import type { PointOfInterest, TrailDetails } from "../types";
import { PointOfInterestCard } from "./point-of-interest-card";
import { TrailCreatorLink } from "./trail-creator-link";
import { DIFFICULTY } from "./trail-difficulty";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";

/** Points of interest listed in the card; the map shows them all. */
const LISTED_POINTS = 3;

/**
 * Body of the trail sheet: cover, key figures, description, creator, first
 * points of interest, then the route on a map with the points of interest
 * pinned along it.
 */
export function TrailDetailsCard({ trail }: { trail: TrailDetails }) {
    const router = useRouter();
    const [viewedPhoto, setViewedPhoto] = useState<ViewedPhoto | null>(null);
    const difficulty = DIFFICULTY[trail.difficulty];

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
        <View style={styles.card}>
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
                        { backgroundColor: difficulty.tint },
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
                    <Text style={styles.name} accessibilityRole="header">
                        {trail.name}
                    </Text>
                    <Text style={styles.location}>
                        {trail.location}
                        <Text style={{ color: difficulty.color }}>
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

            <Text style={styles.description}>{trail.description}</Text>

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
                    <Text style={styles.sectionTitle}>Points d’intérêt</Text>
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

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracé</Text>
                <View style={styles.map}>
                    <TrailRouteMap
                        route={trail.route}
                        pins={pins}
                        onPressPin={(pinId) => {
                            const point = trail.pointsOfInterest.find(
                                (candidate) => candidate.id === pinId,
                            );
                            if (point) viewPoint(point);
                        }}
                    />
                </View>
            </View>

            {credits.length > 0 && (
                <Text style={styles.credits}>
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
    return (
        <View style={styles.figure}>
            <Icon ios={ios} material={material} size={14} color={MUTED} />
            <Text style={styles.figureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: 16,
        padding: 14,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 2px 12px rgba(20, 20, 40, 0.06)",
    },
    summary: { flexDirection: "row", gap: 14 },
    pressed: { opacity: 0.8 },
    cover: {
        width: 128,
        height: 128,
        borderRadius: 18,
        overflow: "hidden",
    },
    summaryText: { flex: 1, gap: 6 },
    name: { fontSize: 18, fontWeight: "700", color: TEXT, lineHeight: 23 },
    location: { fontSize: 13, color: MUTED },
    figures: { gap: 4, marginTop: 2 },
    figure: { flexDirection: "row", alignItems: "center", gap: 6 },
    figureText: { fontSize: 13, color: TEXT },
    description: { fontSize: 14, lineHeight: 21, color: TEXT },
    section: { gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: TEXT },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(30, 30, 47, 0.15)",
    },
    map: { height: 240, borderRadius: 18, overflow: "hidden" },
    credits: { fontSize: 11, lineHeight: 15, color: MUTED },
});
