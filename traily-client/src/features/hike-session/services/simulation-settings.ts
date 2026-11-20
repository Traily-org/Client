import type { SimulationScenario } from "./location-simulator";

// Scenario played by the location simulator, chosen in the settings. In
// memory only, like the other settings for now.
let scenario: SimulationScenario = "follow";
const listeners = new Set<() => void>();

export function subscribeSimulationScenario(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getSimulationScenario(): SimulationScenario {
    return scenario;
}

/** Applies at once, even mid-hike: the walker jumps to the new path. */
export function setSimulationScenario(next: SimulationScenario) {
    if (next === scenario) return;
    scenario = next;
    listeners.forEach((listener) => listener());
}
