import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import { Text, View } from "react-native";

import { Icon } from "./icon";
import { uiClasses, uiColors } from "@/constants/ui-classes";

/** Icon of a list row: SF Symbol on iOS, Material Symbol on Android and web. */
export interface ListRowIconName {
    ios: SFSymbol;
    material: AndroidSymbol;
}

/** Rounded square with the row icon. Decorative: hidden from the screen reader. */
export function ListRowIcon({ name }: { name: ListRowIconName }) {
    return (
        <View
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            className={`h-[30px] w-[30px] items-center justify-center rounded-[9px] ${uiClasses.iconTile}`}
        >
            <Icon
                ios={name.ios}
                material={name.material}
                size={18}
                color={uiColors.icon}
            />
        </View>
    );
}

interface ListRowTextProps {
    label: string;
    description?: string;
    /** Extra classes for the label, e.g. the danger color. */
    labelClassName?: string;
}

/** Label and optional secondary line of a list row. */
export function ListRowText({
    label,
    description,
    labelClassName = uiClasses.text,
}: ListRowTextProps) {
    return (
        <View className="flex-1 gap-0.5">
            <Text className={`text-base ${labelClassName}`}>{label}</Text>
            {description && (
                <Text className={`text-sm ${uiClasses.textMuted}`}>
                    {description}
                </Text>
            )}
        </View>
    );
}

/** Text read by the screen reader for a row: label, then the secondary info. */
export function rowAccessibilityLabel(
    label: string,
    ...details: (string | undefined)[]
): string {
    return [label, ...details].filter(Boolean).join(", ");
}
