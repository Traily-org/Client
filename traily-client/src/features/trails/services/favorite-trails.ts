// TODO(api): favorites live in memory until the API stores them per user.
let favoriteIds: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

export function subscribeFavoriteTrails(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getFavoriteTrailIds(): ReadonlySet<string> {
    return favoriteIds;
}

export function toggleFavoriteTrail(trailId: string) {
    const next = new Set(favoriteIds);
    if (!next.delete(trailId)) next.add(trailId);
    favoriteIds = next;
    listeners.forEach((listener) => listener());
}
