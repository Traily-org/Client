import type { LoginInput, RegisterInput } from "./types";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateLogin(input: LoginInput): FieldErrors<LoginInput> {
    const errors: FieldErrors<LoginInput> = {};
    if (!EMAIL.test(input.email.trim()))
        errors.email = "Adresse e-mail invalide";
    if (!input.password) errors.password = "Mot de passe requis";
    return errors;
}

export function validateRegister(
    input: RegisterInput,
): FieldErrors<RegisterInput> {
    const errors: FieldErrors<RegisterInput> = {};
    if (!input.name.trim()) errors.name = "Nom requis";
    if (!EMAIL.test(input.email.trim()))
        errors.email = "Adresse e-mail invalide";
    if (input.password.length < MIN_PASSWORD_LENGTH) {
        errors.password = `${MIN_PASSWORD_LENGTH} caractères minimum`;
    }
    return errors;
}

export function hasErrors(errors: object): boolean {
    return Object.keys(errors).length > 0;
}
