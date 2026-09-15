/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
    light: {
        // Backgrounds
        background: "#F4EEFF",
        secondaryBackground: "#E4EAF5",

        // Border
        border: "#D1C4E9",

        // Primary
        primary: "#FCB002",
        primaryHover: "#FCB002",
        primaryText: "#1E1E2F",

        // Secondary
        secondary: "#C7D8F5",
        secondaryHover: "#ADC6F0",

        // Disabled
        disabled: "#D1C4E9",
        disabledText: "#5F5F63",

        // Danger
        danger: "#EA412A",
        dangerHover: "#C9391A",
        dangerText: "#FFFFFF",
    },
    dark: {
        // Backgrounds
        background: "#1A1626",
        secondaryBackground: "#241F38",

        // Border
        border: "#3A3C50",

        // Primary
        primary: "#FCB002",
        primaryHover: "#FFCB33",
        primaryText: "#1E1E2F",

        // Secondary
        secondary: "#7C93D6",
        secondaryHover: "#93A8E3",
        secondaryText: "#FFFFFF",

        // Disabled
        disabled: "#3A3450",
        disabledText: "#7A7A85",

        // Danger
        danger: "#D6492E",
        dangerHover: "#E93513",
        dangerText: "#FFFFFF",
    },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: "system-ui",
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: "ui-serif",
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: "ui-rounded",
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "var(--font-display)",
        serif: "var(--font-serif)",
        rounded: "var(--font-rounded)",
        mono: "var(--font-mono)",
    },
});

export const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
