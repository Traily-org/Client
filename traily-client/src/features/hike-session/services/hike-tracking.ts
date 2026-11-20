import {
    angleBetween,
    bearingBetween,
    matchOnLine,
    measureLine,
    metersBetween,
} from "./polyline";
import type { HikeTracking, LngLat, LocationFix } from "../types";

/** Fixes less precise than this are left out, in meters. */
export const MAX_ACCURACY_M = 30;
/**
 * Fastest pace a walker can reach, in m/s (15 km/h): a fix further away
 * from the last one is a GPS glitch. A real jump (after a long signal loss)
 * goes through once enough time has passed to reach it at that pace.
 */
export const MAX_SPEED_MPS = 15 / 3.6;
/** Beyond this distance from the route, the walker may be off the trail. */
export const OFF_TRAIL_M = 20;
/** Within this distance, the walker may be back on it. */
export const BACK_ON_TRAIL_M = 12;
/**
 * Fixes in a row needed to go off or back on the trail: one stray fix
 * doesn't flip the state, at the GPS's few meters of noise.
 */
export const OFF_TRAIL_FIXES = 3;
export const BACK_ON_TRAIL_FIXES = 2;
/**
 * Room behind the progress to look for the walker on the route: a little
 * GPS noise backwards, not a whole loop.
 */
const BACKTRACK_M = 50;
/**
 * Room ahead of the progress to look for the walker while on the trail:
 * where a loop closes near its start, its end isn't matched too early. Off
 * the trail, the whole rest of the route counts, to rejoin it anywhere.
 */
const LOOKAHEAD_M = 300;
/** Distance walked needed to tell the direction of travel from the track. */
const HEADING_MIN_M = 8;
/**
 * Move needed before the track gets a new point, in meters: about twice the
 * GPS noise, so standing still or walking slowly doesn't add distance.
 */
export const TRACK_MIN_STEP_M = 5;

export const NO_TRACKING: HikeTracking = {
    track: [],
    lastFix: null,
    distanceM: 0,
    progressM: 0,
    routeLengthM: 0,
    offTrail: false,
    distanceToRouteM: 0,
    streak: 0,
    position: null,
    heading: 0,
};

/** True when the fix is too imprecise, or too far to have been walked. */
export function isGlitch(fix: LocationFix, last: LocationFix | null): boolean {
    if (fix.accuracyM > MAX_ACCURACY_M) return true;
    if (!last) return false;
    const seconds = (fix.timestamp - last.timestamp) / 1000;
    if (seconds <= 0) return true;
    // The fix's own uncertainty doesn't count as walking.
    const reach = MAX_SPEED_MPS * seconds + fix.accuracyM;
    return metersBetween(last.lngLat, fix.lngLat) > reach;
}

/** Direction of travel over the last meters of the track, if long enough. */
function movingHeading(track: LngLat[], position: LngLat): number | null {
    for (let i = track.length - 1; i >= 0; i--) {
        if (metersBetween(track[i], position) >= HEADING_MIN_M) {
            return bearingBetween(track[i], position);
        }
    }
    return null;
}

/**
 * Adds a GPS fix to the hike: drops glitches, records the walker's own
 * track, moves the progress along the planned route (never back: a U-turn
 * doesn't undo it, and rejoining further on skips the part left out), and
 * tells when the walker leaves or rejoins the route.
 */
export function addFix(
    tracking: HikeTracking,
    fix: LocationFix,
    route: LngLat[],
): HikeTracking {
    if (isGlitch(fix, tracking.lastFix)) return tracking;
    const line = measureLine(route);
    const from = tracking.progressM - BACKTRACK_M;
    const to = tracking.offTrail ? Infinity : tracking.progressM + LOOKAHEAD_M;
    const match = matchOnLine(line, fix.lngLat, from, to);

    // Hysteresis: stepping past the threshold for a few fixes in a row.
    let offTrail = tracking.offTrail;
    let streak = tracking.streak;
    const crossing = offTrail
        ? match.distance <= BACK_ON_TRAIL_M
        : match.distance > OFF_TRAIL_M;
    streak = crossing ? streak + 1 : 0;
    if (streak >= (offTrail ? BACK_ON_TRAIL_FIXES : OFF_TRAIL_FIXES)) {
        offTrail = !offTrail;
        streak = 0;
    }
    const onRoute = !offTrail && match.distance <= OFF_TRAIL_M;

    const moving = movingHeading(tracking.track, fix.lngLat);
    let heading: number;
    if (onRoute) {
        // The route's direction is steadier than the GPS's, turned around
        // when walking it backwards (a blocked path).
        const backwards =
            moving !== null && angleBetween(moving, match.heading) > 90;
        heading = backwards ? (match.heading + 180) % 360 : match.heading;
    } else {
        heading = moving ?? tracking.heading;
    }

    // The track only grows once the walker moved past the GPS noise:
    // adding every fix would count the noise as distance walked.
    const lastPoint = tracking.track[tracking.track.length - 1];
    const step = lastPoint ? metersBetween(lastPoint, fix.lngLat) : 0;
    const grows = !lastPoint || step >= TRACK_MIN_STEP_M;

    return {
        track: grows ? [...tracking.track, fix.lngLat] : tracking.track,
        lastFix: fix,
        distanceM: tracking.distanceM + (grows ? step : 0),
        progressM: onRoute
            ? Math.max(tracking.progressM, match.along)
            : tracking.progressM,
        routeLengthM: line.length,
        offTrail,
        distanceToRouteM: match.distance,
        streak,
        // On the route, the walker is drawn on it rather than a few meters
        // aside, where the GPS put them.
        position: onRoute ? match.point : fix.lngLat,
        heading,
    };
}
