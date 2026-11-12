import { getRecommendedTrails, searchTrails } from "../services/trails-service";

/** Recommended trails while the query is empty, matching trails otherwise. */
export function useTrailSearch(query: string) {
    const isSearching = query.trim().length > 0;
    const trails = isSearching ? searchTrails(query) : getRecommendedTrails();
    return { trails, isSearching };
}
