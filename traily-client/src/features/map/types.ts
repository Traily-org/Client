/** Shared by the native and web `TrailyMap`, which must expose the same API. */
export interface TrailyMapProps {
    /**
     * Extra space kept clear above the bottom safe area for the map chrome
     * (legal notices, mode switcher), e.g. when buttons are overlaid on the
     * bottom of the map.
     */
    bottomOffset?: number;
    /** Set to false when the screen offers its own way to switch modes. */
    showModeSwitcher?: boolean;
}
