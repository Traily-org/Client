import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";

import { authErrorMessage } from "./error-message";
import { hasErrors, validateLogin, validateRegister } from "./validation";

describe("validateLogin", () => {
    it("accepts a valid email and any password", () => {
        expect(
            hasErrors(validateLogin({ email: " a@b.io ", password: "x" })),
        ).toBe(false);
    });

    it("rejects a malformed email and an empty password", () => {
        expect(validateLogin({ email: "nope", password: "" })).toEqual({
            email: "Adresse e-mail invalide",
            password: "Mot de passe requis",
        });
    });
});

describe("validateRegister", () => {
    it("requires a name and an 8-character password", () => {
        const errors = validateRegister({
            name: "  ",
            email: "a@b.io",
            password: "short",
        });
        expect(Object.keys(errors).sort()).toEqual(["name", "password"]);
    });

    it("accepts a complete form", () => {
        expect(
            hasErrors(
                validateRegister({
                    name: "Alice",
                    email: "a@b.io",
                    password: "12345678",
                }),
            ),
        ).toBe(false);
    });
});

describe("authErrorMessage", () => {
    it.each([
        ["invalid_credentials", 401, "E-mail ou mot de passe incorrect"],
        ["email_taken", 409, "Un compte existe déjà avec cet e-mail"],
        [
            "network_error",
            0,
            "Impossible de joindre le serveur, vérifiez votre connexion",
        ],
        ["http_error", 500, "Une erreur est survenue, réessayez"],
    ])("maps %s", (code, status, message) => {
        expect(authErrorMessage(new ApiError(status, code, "x"))).toBe(message);
    });

    it("handles non-API errors", () => {
        expect(authErrorMessage(new Error("boom"))).toBe(
            "Une erreur inattendue est survenue",
        );
    });
});
