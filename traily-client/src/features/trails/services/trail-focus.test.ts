import { describe, expect, it } from "vitest";

import type { Bounds } from "@/utils/bounds";

import type { TrailRoute } from "../types";
import {
    dismissFocus,
    focusAfterViewport,
    focusByPress,
    NO_FOCUS,
    pickZoomFocus,
    ZOOM_FOCUS_KEEP_ZOOM,
    ZOOM_FOCUS_MIN_ZOOM,
} from "./trail-focus";

/** Zoomed in enough to focus, between the two thresholds, and zoomed out. */
const IN = ZOOM_FOCUS_MIN_ZOOM + 0.5;
const BETWEEN = (ZOOM_FOCUS_MIN_ZOOM + ZOOM_FOCUS_KEEP_ZOOM) / 2;
const OUT = ZOOM_FOCUS_KEEP_ZOOM - 0.5;

// Two straight trails, far enough apart for a close zoom to show only one.
const NORTH: TrailRoute = {
    id: "north",
    name: "Nord",
    route: [
        [0, 10],
        [10, 10],
    ],
};
const SOUTH: TrailRoute = {
    id: "south",
    name: "Sud",
    route: [
        [0, 0],
        [10, 0],
    ],
};
const TRAILS = [NORTH, SOUTH];

/** Screen centered on `[lng, lat]`, 4 units wide and tall. */
function screen(lng: number, lat: number, zoom: number) {
    const bounds: Bounds = [lng - 2, lat - 2, lng + 2, lat + 2];
    return { bounds, zoom };
}

describe("pickZoomFocus", () => {
    it("picks the only trail crossing the middle when zoomed in", () => {
        expect(pickZoomFocus(screen(5, 10, IN), TRAILS)).toBe("north");
    });

    it("picks nothing below the zoom threshold", () => {
        expect(pickZoomFocus(screen(5, 10, BETWEEN), TRAILS)).toBeNull();
        expect(pickZoomFocus(screen(5, 10, OUT), TRAILS)).toBeNull();
    });

    it("picks nothing when the trail only crosses the edge of the screen", () => {
        expect(pickZoomFocus(screen(5, 8.5, IN), TRAILS)).toBeNull();
    });

    it("picks nothing when two trails cross the middle", () => {
        const close = {
            ...SOUTH,
            route: [
                [0, 10.2],
                [10, 10.2],
            ],
        } as TrailRoute;
        expect(pickZoomFocus(screen(5, 10, IN), [NORTH, close])).toBeNull();
    });
});

describe("focusAfterViewport", () => {
    it("focuses the trail zoomed in on, without a press", () => {
        expect(focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS)).toEqual(
            { focus: { trailId: "north", source: "zoom" }, dismissedId: null },
        );
    });

    it("keeps a zoom focus slightly zoomed out, then drops it", () => {
        const focused = focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS);
        // Between the two thresholds: kept, no flicker.
        expect(
            focusAfterViewport(focused, screen(5, 10, BETWEEN), TRAILS),
        ).toBe(focused);
        expect(
            focusAfterViewport(focused, screen(5, 10, OUT), TRAILS).focus,
        ).toBeNull();
    });

    it("keeps a zoom focus when its trail moves off the middle", () => {
        const focused = focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS);
        expect(
            focusAfterViewport(focused, screen(5, 8.5, IN), TRAILS).focus
                ?.trailId,
        ).toBe("north");
    });

    it("drops the focus once the trail leaves the screen", () => {
        const pressed = focusByPress("north");
        expect(
            focusAfterViewport(pressed, screen(5, 5, IN), TRAILS).focus,
        ).toBeNull();
    });

    it("keeps a press focus when zooming onto another trail", () => {
        const pressed = focusByPress("north");
        // South crosses the middle, north is still at the top of the screen.
        const tall = { bounds: [3, -9, 7, 10.5] as Bounds, zoom: IN };
        expect(pickZoomFocus(tall, TRAILS)).toBe("south");
        expect(focusAfterViewport(pressed, tall, TRAILS)).toBe(pressed);
    });

    it("keeps a press focus at any zoom while on screen", () => {
        const pressed = focusByPress("north");
        expect(focusAfterViewport(pressed, screen(5, 10, 9), TRAILS)).toBe(
            pressed,
        );
    });

    it("switches the zoom focus to the next trail zoomed in on", () => {
        const focused = focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS);
        expect(
            focusAfterViewport(focused, screen(5, 0, IN), TRAILS).focus
                ?.trailId,
        ).toBe("south");
    });

    it("doesn't focus by zooming when turned off", () => {
        expect(
            focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS, false),
        ).toBe(NO_FOCUS);
    });
});

describe("dismissFocus", () => {
    it("doesn't reopen a closed preview until zooming out", () => {
        const focused = focusAfterViewport(NO_FOCUS, screen(5, 10, IN), TRAILS);
        const closed = dismissFocus(focused);
        expect(closed).toEqual({ focus: null, dismissedId: "north" });

        // Panning along the same trail: stays closed.
        expect(
            focusAfterViewport(closed, screen(6, 10, IN), TRAILS).focus,
        ).toBeNull();

        // Zoomed out, then back in: the preview comes back.
        const zoomedOut = focusAfterViewport(
            closed,
            screen(5, 10, OUT),
            TRAILS,
        );
        expect(zoomedOut.dismissedId).toBeNull();
        expect(
            focusAfterViewport(zoomedOut, screen(5, 10, IN), TRAILS).focus
                ?.trailId,
        ).toBe("north");
    });

    it("lets another trail take the focus by zooming", () => {
        const closed = dismissFocus(focusByPress("north"));
        expect(
            focusAfterViewport(closed, screen(5, 0, IN), TRAILS).focus?.trailId,
        ).toBe("south");
    });

    it("lets a press reopen a closed preview", () => {
        const closed = dismissFocus(focusByPress("north"));
        expect(focusByPress("north").focus?.trailId).toBe("north");
        expect(closed.focus).toBeNull();
    });
});
