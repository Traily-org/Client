import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/icon";
import { mapOverlayColors, withAlpha } from "@/constants/theme-colors";

import { ROUTE_COLOR } from "../style/map-styles";

interface RouteMarkerProps {
    /** Color of the route it marks. */
    color?: string;
}

const MARKER_SHADOW = `0px 1px 3px ${withAlpha(mapOverlayColors.shadow, 0.3)}`;

/** Start of a route: a ring, as on the trail sketches. */
export function RouteStartMarker({ color = ROUTE_COLOR }: RouteMarkerProps) {
    return <View style={[styles.start, { borderColor: color }]} />;
}

/** End of a route: a cross. */
export function RouteEndMarker({ color = ROUTE_COLOR }: RouteMarkerProps) {
    return (
        <View style={[styles.end, { backgroundColor: color }]}>
            <Icon
                ios="xmark"
                material="close"
                size={12}
                color={mapOverlayColors.surface}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    start: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 4,
        backgroundColor: mapOverlayColors.surface,
        boxShadow: MARKER_SHADOW,
    },
    end: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: mapOverlayColors.surface,
        boxShadow: MARKER_SHADOW,
    },
});
