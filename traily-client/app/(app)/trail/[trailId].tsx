import { useLocalSearchParams } from "expo-router";

import { TrailSheet } from "@/features/trails";

// 1.2.2 Fiche rando (TRA-81).
export default function TrailScreen() {
    const { trailId } = useLocalSearchParams<{ trailId: string }>();
    return <TrailSheet trailId={trailId} />;
}
