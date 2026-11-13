import { beforeEach, describe, expect, it } from "vitest";

import {
    estimateDistanceKm,
    formatDistanceKm,
    formatElapsed,
    getElapsedMs,
} from "./hike-metrics";
import {
    clearHikeTrail,
    endHike,
    getHikeSession,
    pauseHike,
    resumeHike,
    selectHikeTrail,
    startHike,
} from "./hike-session";

const TRAIL = {
    id: "semnoz",
    name: "Tour du Semnoz",
    distanceKm: 2,
    elevationGainM: 620,
};
const MINUTE = 60_000;

describe("hike session", () => {
    beforeEach(() => endHike());

    it("keeps the picked trail until the hike ends", () => {
        selectHikeTrail(TRAIL);
        startHike(0);
        expect(getHikeSession().trail).toEqual(TRAIL);
        endHike();
        expect(getHikeSession()).toMatchObject({ status: "idle", trail: null });
    });

    it("ignores trail changes once started", () => {
        selectHikeTrail(TRAIL);
        startHike(0);
        selectHikeTrail({ ...TRAIL, id: "other" });
        clearHikeTrail();
        expect(getHikeSession().trail?.id).toBe("semnoz");
    });

    it("does not start without a trail", () => {
        startHike(0);
        expect(getHikeSession().status).toBe("idle");
    });

    it("stops the clock while paused", () => {
        selectHikeTrail(TRAIL);
        startHike(0);
        pauseHike(10 * MINUTE);
        expect(getElapsedMs(getHikeSession(), 25 * MINUTE)).toBe(10 * MINUTE);
        resumeHike(30 * MINUTE);
        expect(getElapsedMs(getHikeSession(), 35 * MINUTE)).toBe(15 * MINUTE);
    });

    it("never counts time before the current stretch started", () => {
        selectHikeTrail(TRAIL);
        startHike(10 * MINUTE);
        expect(getElapsedMs(getHikeSession(), 5 * MINUTE)).toBe(0);
    });
});

describe("hike metrics", () => {
    it("estimates distance at walking pace, capped at the trail", () => {
        expect(estimateDistanceKm(15 * MINUTE, null)).toBe(1);
        expect(estimateDistanceKm(60 * MINUTE, TRAIL)).toBe(2);
    });

    it("formats time and distance for display", () => {
        expect(formatElapsed(4 * MINUTE + 7_000)).toBe("4:07");
        expect(formatElapsed(64 * MINUTE + 7_000)).toBe("1:04:07");
        expect(formatDistanceKm(2.44)).toBe("2,4 km");
    });
});
