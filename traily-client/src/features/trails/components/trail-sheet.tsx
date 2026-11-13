import { useRouter } from "expo-router";

import { TrailSheetContent } from "./trail-sheet-content";

interface TrailSheetProps {
    trailId: string;
}

/**
 * Trail sheet as a screen of its own, for the links to a trail from outside
 * the search (history, deep links). The search opens `TrailSheetPanel`
 * instead.
 */
export function TrailSheet({ trailId }: TrailSheetProps) {
    const router = useRouter();

    function close() {
        if (router.canGoBack()) router.back();
        else router.replace("/");
    }

    return <TrailSheetContent trailId={trailId} onClose={close} />;
}
