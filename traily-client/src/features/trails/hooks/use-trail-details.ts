import { getTrailDetails } from "../services/trails-service";

/** Everything the trail sheet shows, undefined for an unknown trail. */
export function useTrailDetails(trailId: string) {
    return getTrailDetails(trailId);
}
