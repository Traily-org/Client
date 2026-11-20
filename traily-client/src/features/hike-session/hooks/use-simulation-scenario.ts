import { useSyncExternalStore } from "react";

import type { SimulationScenario } from "../services/location-simulator";
import {
    getSimulationScenario,
    subscribeSimulationScenario,
} from "../services/simulation-settings";

/** Scenario the location simulator plays, chosen in the settings. */
export function useSimulationScenario(): SimulationScenario {
    return useSyncExternalStore(
        subscribeSimulationScenario,
        getSimulationScenario,
        getSimulationScenario,
    );
}
