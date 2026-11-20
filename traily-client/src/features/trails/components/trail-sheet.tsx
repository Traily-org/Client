import { useRouter } from "expo-router";

import type { TrailDetails } from "../types";
import type { TrailSelectState } from "./select-trail-button";
import { TrailSheetContent } from "./trail-sheet-content";

interface TrailSheetProps {
    trailId: string;
    /** Shows the "Choisir" button; the sheet closes once it is pressed. */
    onSelect?: (trail: TrailDetails) => void;
    selectState?: TrailSelectState;
}

/**
 * Trail sheet as a screen of its own, for the links to a trail from outside
 * the search (home map, history, deep links). The search opens
 * `TrailSheetPanel` instead.
 */
export function TrailSheet({
    trailId,
    onSelect,
    selectState,
}: TrailSheetProps) {
    const router = useRouter();

    function close() {
        if (router.canGoBack()) router.back();
        else router.replace("/");
    }

    return (
        <TrailSheetContent
            trailId={trailId}
            onClose={close}
            onSelect={
                onSelect
                    ? (trail) => {
                          onSelect(trail);
                          close();
                      }
                    : undefined
            }
            selectState={selectState}
        />
    );
}
