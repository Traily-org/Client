import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/icon";

import { ROUTE_COLOR } from "../style/map-styles";

/** Start of a route: a ring, as on the trail sketches. */
export function RouteStartMarker() {
    return <View style={styles.start} />;
}

/** End of a route: a cross. */
export function RouteEndMarker() {
    return (
        <View style={styles.end}>
            <Icon ios="xmark" material="close" size={12} color="#FFFFFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    start: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: ROUTE_COLOR,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 1px 3px rgba(20, 20, 40, 0.3)",
    },
    end: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: ROUTE_COLOR,
        boxShadow: "0px 1px 3px rgba(20, 20, 40, 0.3)",
    },
});
