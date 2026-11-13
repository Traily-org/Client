import { Pressable, type PressableProps, Text, View } from "react-native";

import {
    ListRowIcon,
    type ListRowIconName,
    ListRowText,
    rowAccessibilityLabel,
} from "./list-row-parts";
import { MIN_TOUCH_TARGET_CLASS, uiClasses } from "@/constants/ui-classes";

/** A row of a {@link ListSection} that opens a screen or triggers an action. */
export interface ListRowProps extends Omit<
    PressableProps,
    "children" | "style" | "accessibilityLabel"
> {
    /** Visible text, also read by the screen reader. */
    label: string;
    /** Secondary line under the label. */
    description?: string;
    icon?: ListRowIconName;
    /** Current value shown on the right, e.g. "Par défaut". */
    value?: string;
    /** `danger` for destructive actions, such as signing out. */
    tone?: "default" | "danger";
    /** Show a chevron when the row opens another screen. */
    showChevron?: boolean;
}

/**
 * Generic pressable list row. Role, label and the 44 pt touch target are set
 * here, so every screen built with it is accessible by default. Wrap it in
 * `<Link asChild>` to navigate.
 */
export function ListRow({
    label,
    description,
    icon,
    value,
    tone = "default",
    showChevron = false,
    disabled,
    ...pressableProps
}: ListRowProps) {
    const danger = tone === "danger";

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={rowAccessibilityLabel(
                label,
                value,
                description,
            )}
            accessibilityState={{ disabled: Boolean(disabled) }}
            disabled={disabled}
            {...pressableProps}
        >
            {({ pressed }) => (
                <View
                    className={`${MIN_TOUCH_TARGET_CLASS} flex-row items-center gap-3 px-4 py-2.5 ${
                        pressed ? uiClasses.pressed : ""
                    } ${disabled ? "opacity-50" : ""}`}
                >
                    {icon && <ListRowIcon name={icon} />}
                    {danger ? (
                        <Text
                            className={`flex-1 text-center text-base font-semibold ${uiClasses.textDanger}`}
                        >
                            {label}
                        </Text>
                    ) : (
                        <ListRowText label={label} description={description} />
                    )}
                    {value && (
                        <Text className={`text-sm ${uiClasses.textMuted}`}>
                            {value}
                        </Text>
                    )}
                    {showChevron && (
                        <Text
                            importantForAccessibility="no"
                            accessibilityElementsHidden
                            className={`text-xl ${uiClasses.textMuted}`}
                        >
                            ›
                        </Text>
                    )}
                </View>
            )}
        </Pressable>
    );
}
