import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { session } from "./instance";

/** Restores the stored session, keeping the splash visible until it is known. */
export function useHydrateSession() {
    useEffect(() => {
        session.hydrate().finally(SplashScreen.hide);
    }, []);
}
