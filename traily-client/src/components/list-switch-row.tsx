import { Pressable, Switch, View } from "react-native";

import {
    ListRowIcon,
    type ListRowIconName,
    ListRowText,
    rowAccessibilityLabel,
} from "./list-row-parts";
import { MIN_TOUCH_TARGET_CLASS } from "@/constants/ui-classes";

interface ListSwitchRowProps {
    /** Visible text, also read by the screen reader. */
    label: string;
    /** Secondary line under the label. */
    description?: string;
    icon?: ListRowIconName;
    value: boolean;
    /** Called with the new value. Omit it while the setting is not wired. */
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
}

/**
 * Generic on/off row of a {@link ListSection}. The whole row is the switch:
 * one touch target and one element for the screen reader.
 */
export function ListSwitchRow({
    label,
    description,
    icon,
    value,
    onValueChange,
    disabled = false,
}: ListSwitchRowProps) {
    const isDisabled = disabled || !onValueChange;

    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityLabel={rowAccessibilityLabel(label, description)}
            accessibilityState={{ checked: value, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onValueChange?.(!value)}
            className={`${MIN_TOUCH_TARGET_CLASS} flex-row items-center gap-3 px-4 py-2.5 ${
                isDisabled ? "opacity-50" : ""
            }`}
        >
            {icon && <ListRowIcon name={icon} />}
            <ListRowText label={label} description={description} />
            {/* Visual only: the row handles the touch and the screen reader. */}
            <View
                pointerEvents="none"
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                <Switch value={value} disabled={isDisabled} />
            </View>
        </Pressable>
    );
}
