import { ApiError } from "@/lib/api/client";

/** French, user-facing message for an auth failure. */
export function authErrorMessage(err: unknown): string {
    if (!(err instanceof ApiError)) return "Une erreur inattendue est survenue";
    switch (err.code) {
        case "UNAUTHORIZED":
            return "E-mail ou mot de passe incorrect";
        case "CONFLICT":
            return "Un compte existe déjà avec cet e-mail";
        case "RATE_LIMITED":
            return "Trop de tentatives, réessayez dans quelques minutes";
        case "network_error":
        case "timeout":
            return "Impossible de joindre le serveur, vérifiez votre connexion";
        default:
            return "Une erreur est survenue, réessayez";
    }
}
