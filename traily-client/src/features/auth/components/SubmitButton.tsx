import { ActivityIndicator, Pressable, Text } from "react-native";

import { useTheme } from "@/hooks/use-theme";

interface SubmitButtonProps {
    label: string;
    pending: boolean;
    onPress: () => void;
}

export function SubmitButton({ label, pending, onPress }: SubmitButtonProps) {
    const theme = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: pending, busy: pending }}
            disabled={pending}
            onPress={onPress}
            className="mt-2 min-h-12 w-full items-center justify-center rounded-lg px-4"
            style={{
                backgroundColor: pending ? theme.disabled : theme.primary,
            }}
        >
            {pending ? (
                <ActivityIndicator color={theme.primaryText} />
            ) : (
                <Text
                    className="text-base font-semibold"
                    style={{ color: theme.primaryText }}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    );
}
