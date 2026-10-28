import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    FormError,
    session,
    SubmitButton,
    TextField,
    useAuthForm,
    validateLogin,
} from "@/features/auth";

export default function LoginScreen() {
    const form = useAuthForm(
        { email: "", password: "" },
        validateLogin,
        session.login,
    );
    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1 items-center justify-center px-6"
            >
                <Text
                    accessibilityRole="header"
                    className="mb-8 text-3xl font-bold"
                >
                    Connexion
                </Text>
                <FormError message={form.formError} />
                <TextField
                    label="E-mail"
                    value={form.values.email}
                    onChangeText={(v) => form.setField("email", v)}
                    error={form.errors.email}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                />
                <TextField
                    label="Mot de passe"
                    value={form.values.password}
                    onChangeText={(v) => form.setField("password", v)}
                    error={form.errors.password}
                    secureTextEntry
                    autoComplete="current-password"
                    textContentType="password"
                    onSubmitEditing={form.onSubmit}
                />
                <SubmitButton
                    label="Se connecter"
                    pending={form.pending}
                    onPress={form.onSubmit}
                />
                <Link href="/auth/register" className="mt-6 text-center">
                    Pas encore de compte ? Créer un compte
                </Link>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
