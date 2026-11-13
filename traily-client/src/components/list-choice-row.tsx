import { Pressable, Text, View } from "react-native";

import {
    ListRowIcon,
    type ListRowIconName,
    ListRowText,
} from "./list-row-parts";
import { uiClasses } from "@/constants/ui-classes";

/** One option of a {@link ListChoiceRow}. */
export interface ListChoiceOption<T extends string> {
    value: T;
    /** Visible text, also read by the screen reader. */
    label: string;
}

interface ListChoiceRowProps<T extends string> {
    /** Visible text, also read by the screen reader. */
    label: string;
    /** Secondary line under the label. */
    description?: string;
    icon?: ListRowIconName;
    options: readonly ListChoiceOption<T>[];
    /** Selected option. Omit it when no choice is made yet. */
    value?: T;
    /** Called with the chosen option. Omit it while the setting is not wired. */
    onChange?: (value: T) => void;
    disabled?: boolean;
}

/**
 * Generic row of a {@link ListSection} to pick one option among a few,
 * shown as pills. Read as a group of radio buttons.
 */
export function ListChoiceRow<T extends string>({
    label,
    description,
    icon,
    options,
    value,
    onChange,
    disabled = false,
}: ListChoiceRowProps<T>) {
    const isDisabled = disabled || !onChange;

    return (
        <View
            accessibilityRole="radiogroup"
            accessibilityLabel={label}
            accessibilityState={{ disabled: isDisabled }}
            className={`gap-3 px-4 py-3 ${isDisabled ? "opacity-50" : ""}`}
        >
            <View className="flex-row items-center gap-3">
                {icon && <ListRowIcon name={icon} />}
                <ListRowText label={label} description={description} />
            </View>
            <View className="flex-row flex-wrap gap-2">
                {options.map((option) => {
                    const selected = option.value === value;
                    return (
                        <Pressable
                            key={option.value}
                            accessibilityRole="radio"
                            accessibilityLabel={option.label}
                            accessibilityState={{
                                checked: selected,
                                disabled: isDisabled,
                            }}
                            disabled={isDisabled}
                            onPress={() => onChange?.(option.value)}
                            // 36 px pill + 4 px of touch area on each side = 44 px target.
                            hitSlop={4}
                            className={`min-h-[36px] justify-center rounded-full px-4 ${
                                selected
                                    ? uiClasses.chipSelected
                                    : uiClasses.chip
                            }`}
                        >
                            <Text
                                className={`text-sm ${
                                    selected
                                        ? `font-semibold ${uiClasses.textOnSelected}`
                                        : uiClasses.text
                                }`}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
