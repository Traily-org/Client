import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TrailyMap } from "@/features/map";

export default function MapScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <TrailyMap />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
