import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

/**
 * Vibrates when the walker leaves the planned route (a warning) and when
 * they rejoin it (a success). `offTrail` is null without a hike in
 * progress: starting or ending one doesn't vibrate.
 */
export function useOffTrailFeedback(offTrail: boolean | null) {
    const previousRef = useRef(offTrail);

    useEffect(() => {
        const previous = previousRef.current;
        previousRef.current = offTrail;
        if (previous === null || offTrail === null || previous === offTrail) {
            return;
        }
        void Haptics.notificationAsync(
            offTrail
                ? Haptics.NotificationFeedbackType.Warning
                : Haptics.NotificationFeedbackType.Success,
        );
    }, [offTrail]);
}
