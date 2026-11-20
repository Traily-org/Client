import { type Bounds, containsBounds, padBounds } from "@/utils/bounds";

/**
 * Margin loaded around the screen, as a ratio of its size on each side: a
 * small pan or zoom stays inside it and needs no new request.
 */
export const NEARBY_AREA_MARGIN = 0.5;

/**
 * Area to load trails for after the map settled on `viewport`, or null
 * while `loaded` (the area already loaded) still covers the whole screen.
 */
export function nextNearbyArea(
    viewport: Bounds,
    loaded: Bounds | null,
): Bounds | null {
    if (loaded && containsBounds(loaded, viewport)) return null;
    return padBounds(viewport, NEARBY_AREA_MARGIN);
}
