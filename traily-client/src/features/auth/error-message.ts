import { ApiError } from "@/lib/api/client";

/** French, user-facing message for an auth failure. */
export function authErrorMessage(err: unknown): string {
    if (!(err instanceof ApiError)) return "Une erreur inattendue est survenue";
    switch (err.code) {
        case "invalid_credentials":
            return "E-mail ou mot de passe incorrect";
        case "email_taken":
            return "Un compte existe déjà avec cet e-mail";
        case "network_error":
        case "timeout":
            return "Impossible de joindre le serveur, vérifiez votre connexion";
        default:
            return err.status === 401
                ? "E-mail ou mot de passe incorrect"
                : "Une erreur est survenue, réessayez";
    }
}
