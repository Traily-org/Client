import { useSyncExternalStore } from "react";

import {
    getFavoriteTrailIds,
    subscribeFavoriteTrails,
    toggleFavoriteTrail,
} from "../services/favorite-trails";

/** Whether the trail is a favorite, and a toggle for it. */
export function useFavoriteTrail(trailId: string) {
    const favoriteIds = useSyncExternalStore(
        subscribeFavoriteTrails,
        getFavoriteTrailIds,
        getFavoriteTrailIds,
    );
    return {
        isFavorite: favoriteIds.has(trailId),
        toggleFavorite: () => toggleFavoriteTrail(trailId),
    };
}
