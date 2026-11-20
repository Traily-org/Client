import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { session } from "../instance";
import { useAuthForm } from "../use-auth-form";
import { validateRegister } from "../validation";
import { FormError } from "./form-error";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export function RegisterScreen() {
    const form = useAuthForm(
        { name: "", email: "", password: "" },
        validateRegister,
        session.register,
    );
    return (
        <SafeAreaView className="flex-1 bg-screen">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1 items-center justify-center px-6"
            >
                <Text
                    accessibilityRole="header"
                    className="mb-8 text-3xl font-bold text-foreground"
                >
                    Inscription
                </Text>
                <FormError message={form.formError} />
                <TextField
                    label="Nom"
                    value={form.values.name}
                    onChangeText={(v) => form.setField("name", v)}
                    error={form.errors.name}
                    autoComplete="name"
                    textContentType="name"
                />
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
                    autoComplete="new-password"
                    textContentType="newPassword"
                    onSubmitEditing={form.onSubmit}
                />
                <SubmitButton
                    label="Créer mon compte"
                    pending={form.pending}
                    onPress={form.onSubmit}
                />
                <Link
                    href="/login"
                    className="mt-6 text-center text-foreground-muted"
                >
                    Déjà un compte ? Se connecter
                </Link>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
