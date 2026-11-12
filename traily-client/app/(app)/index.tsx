import { StyleSheet, View } from "react-native";

import { ScaffoldMapControls } from "@/components/scaffold-map-controls";
import { CORNER_BUTTON_SIZE, MapControls, TrailyMap } from "@/features/map";
import { TrailResults } from "@/features/trails";

// Full-bleed map: the controls handle the safe areas themselves. The hike
// bar comes before MapControls so the search panel covers it.
export default function MapScreen() {
    return (
        <View style={styles.container}>
            <TrailyMap bottomOffset={CORNER_BUTTON_SIZE} />
            <ScaffoldMapControls />
            <MapControls
                renderSearchResults={(query) => <TrailResults query={query} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
