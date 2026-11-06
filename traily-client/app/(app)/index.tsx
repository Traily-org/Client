import { StyleSheet, View } from "react-native";

import { ScaffoldMapControls } from "@/components/scaffold-map-controls";
import { CORNER_BUTTON_SIZE, MapControls, TrailyMap } from "@/features/map";

// Full-bleed map: the controls handle the safe areas themselves.
export default function MapScreen() {
    return (
        <View style={styles.container}>
            <TrailyMap bottomOffset={CORNER_BUTTON_SIZE} />
            <MapControls />
            <ScaffoldMapControls />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
