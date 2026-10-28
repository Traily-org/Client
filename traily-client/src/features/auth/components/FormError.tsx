import { Text } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export function FormError({ message }: { message: string | null }) {
    const theme = useTheme();
    if (!message) return null;
    return (
        <Text
            accessibilityRole="alert"
            className="mb-4 w-full text-center"
            style={{ color: theme.danger }}
        >
            {message}
        </Text>
    );
}
