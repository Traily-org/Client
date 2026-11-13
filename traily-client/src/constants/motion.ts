import { Easing, type WithTimingConfig } from "react-native-reanimated";

export const EASE_OUT = Easing.out(Easing.cubic);

/** Quick squeeze when a finger lands. */
export const PRESS_IN: WithTimingConfig = { duration: 110, easing: EASE_OUT };

/** Settles back, no overshoot. */
export const PRESS_OUT: WithTimingConfig = { duration: 220, easing: EASE_OUT };

/** Layout changes (search bar focus) and small icon turns. */
export const TRANSITION: WithTimingConfig = { duration: 240, easing: EASE_OUT };

/** Full-screen sheet rising from the bottom: fast start, long soft landing. */
export const SHEET_OPEN: WithTimingConfig = {
    duration: 460,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
};

/** Sheet going back down. */
export const SHEET_CLOSE: WithTimingConfig = {
    duration: 320,
    easing: Easing.inOut(Easing.cubic),
};

/** Entrance of the overlay controls when the screen appears, in ms. */
export const ENTER_DURATION = 380;
