/**
 * Half the side of the square searched for a trail around a long press: a
 * finger covers more than a thin line.
 */
export const TRAIL_HIT_RADIUS = 22;

/** Duration of the move framing a long-pressed trail, in ms. */
export const TRAIL_FOCUS_DURATION = 700;

/** Room the search bar takes at the top, below the safe area. */
const TOP_CONTROLS = 90;
/** Room the trail preview takes above the corner buttons. */
const BOTTOM_PREVIEW = 140;
const SIDE = 40;

/**
 * Padding of the framing of a long-pressed trail: the whole route stays
 * visible between the search bar and the preview over the corner buttons.
 */
export function getTrailFocusPadding(
    insets: { top: number; bottom: number },
    bottomOffset: number,
) {
    return {
        top: insets.top + TOP_CONTROLS,
        right: SIDE,
        bottom: insets.bottom + bottomOffset + BOTTOM_PREVIEW,
        left: SIDE,
    };
}
