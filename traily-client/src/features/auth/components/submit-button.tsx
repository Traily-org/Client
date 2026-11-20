import { ActivityIndicator, Pressable, Text } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

interface SubmitButtonProps {
    label: string;
    pending: boolean;
    onPress: () => void;
}

export function SubmitButton({ label, pending, onPress }: SubmitButtonProps) {
    const colors = useThemeColors();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: pending, busy: pending }}
            disabled={pending}
            onPress={onPress}
            className={`mt-2 min-h-12 w-full items-center justify-center rounded-lg bg-chip-selected px-4 ${
                pending ? "opacity-50" : ""
            }`}
        >
            {pending ? (
                <ActivityIndicator color={colors["on-chip-selected"]} />
            ) : (
                <Text className="text-base font-semibold text-on-chip-selected">
                    {label}
                </Text>
            )}
        </Pressable>
    );
}
