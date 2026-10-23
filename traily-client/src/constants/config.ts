/**
 * Lowest zoom level the map can be zoomed out to. 0 = no limit (the whole
 * world, MapLibre's own default). Raise it (e.g. 12) to keep the view around
 * the area the app cares about: at a near-global view most tiles aren't
 * cached yet and stay visibly blank while they load. Zooms 0-2 all look like
 * "the whole world", so use 5+ for the limit to actually be noticeable.
 *
 * Zooming in has no client-side cap (MapLibre's default max, 22, applies).
 * Past the source data's own max zoom the deepest available tile is just
 * scaled up ("overzoom"), which is normal MapLibre behavior, not a bug.
 */
export const MAP_MIN_ZOOM = 0;
