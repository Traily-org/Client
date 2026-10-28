import { Text, TextInput, type TextInputProps, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

interface TextFieldProps extends TextInputProps {
    label: string;
    error?: string;
}

export function TextField({ label, error, ...input }: TextFieldProps) {
    const theme = useTheme();
    return (
        <View className="mb-4 w-full">
            <Text className="mb-1 text-sm font-medium">{label}</Text>
            <TextInput
                accessibilityLabel={label}
                accessibilityHint={error}
                className="rounded-lg border px-3 py-3 text-base"
                style={{
                    borderColor: error ? theme.danger : theme.border,
                    backgroundColor: theme.secondaryBackground,
                }}
                {...input}
            />
            {error ? (
                <Text className="mt-1 text-sm" style={{ color: theme.danger }}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
