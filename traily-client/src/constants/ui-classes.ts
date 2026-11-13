/**
 * Temporary colors shared by the generic UI components. They live in one
 * place so the theme (TRA-126) can swap them for light/dark tokens without
 * touching the components or the screens.
 */
export const uiClasses = {
    screen: "bg-gray-100",
    surface: "bg-white",
    pressed: "bg-gray-100",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    textDanger: "text-red-600",
    separator: "bg-gray-100",
    /** Square behind a row icon. */
    iconTile: "bg-gray-100",
    /** Unselected option of a choice row. */
    chip: "bg-gray-100",
    /** Selected option of a choice row, and the text on it. */
    chipSelected: "bg-gray-900",
    textOnSelected: "text-white",
} as const;

/** Colors passed as values, for components that take no class (icons). */
export const uiColors = {
    icon: "#4b5563",
} as const;

/** Minimum touch target (Apple: 44 pt). Pixel value: NativeWind's rem is 14 px on native. */
export const MIN_TOUCH_TARGET_CLASS = "min-h-[44px]";
