import { useSyncExternalStore } from "react";

import type { MapMode } from "../style/map-styles";

// Shared by the map and the settings screen. In memory only: back to the
// default on each app launch until the app has a persisted store.
let currentMode: MapMode = "trail";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getMode() {
    return currentMode;
}

export function setMapMode(mode: MapMode) {
    if (mode === currentMode) return;
    currentMode = mode;
    listeners.forEach((listener) => listener());
}

/** Base map chosen in the settings. */
export function useMapMode(): MapMode {
    return useSyncExternalStore(subscribe, getMode, getMode);
}
