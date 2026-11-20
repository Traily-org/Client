import { Text, TextInput, type TextInputProps, View } from "react-native";

interface TextFieldProps extends TextInputProps {
    label: string;
    error?: string;
}

export function TextField({ label, error, ...input }: TextFieldProps) {
    return (
        <View className="mb-4 w-full">
            <Text className="mb-1 text-sm font-medium text-foreground">
                {label}
            </Text>
            <TextInput
                accessibilityLabel={label}
                accessibilityHint={error}
                className={`rounded-lg border bg-surface px-3 py-3 text-base text-foreground ${
                    error ? "border-danger" : "border-separator"
                }`}
                {...input}
            />
            {error ? (
                <Text className="mt-1 text-sm text-danger">{error}</Text>
            ) : null}
        </View>
    );
}
