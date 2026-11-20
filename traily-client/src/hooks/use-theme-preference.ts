import { useSyncExternalStore } from "react";

/** Theme chosen by the user. "system" follows the device. */
export type ThemePreference = "system" | "light" | "dark";

// In memory only: back to "system" on each launch until the app can persist
// settings on the device.
let currentPreference: ThemePreference = "system";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getPreference() {
    return currentPreference;
}

/** Changes the theme of the whole app. */
export function setThemePreference(preference: ThemePreference) {
    if (preference === currentPreference) return;
    currentPreference = preference;
    listeners.forEach((listener) => listener());
}

/** Theme chosen by the user, "system" by default. */
export function useThemePreference(): ThemePreference {
    return useSyncExternalStore(subscribe, getPreference, getPreference);
}
