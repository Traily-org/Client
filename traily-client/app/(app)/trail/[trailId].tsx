import { useLocalSearchParams } from "expo-router";

import { selectHikeTrail, useHikeSession } from "@/features/hike-session";
import { TrailSheet, type TrailSelectState } from "@/features/trails";

// 1.2.2 Fiche rando (TRA-81), opened from the home map (TRA-137). Picking
// the trail sets the next hike's trail, as in the search.
export default function TrailScreen() {
    const { trailId } = useLocalSearchParams<{ trailId: string }>();
    const hike = useHikeSession();

    let selectState: TrailSelectState = "available";
    if (hike.status !== "idle") selectState = "locked";
    else if (hike.trail?.id === trailId) selectState = "selected";

    return (
        <TrailSheet
            trailId={trailId}
            onSelect={selectHikeTrail}
            selectState={selectState}
        />
    );
}
