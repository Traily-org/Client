import { useState } from "react";

import { authErrorMessage } from "./error-message";
import { type FieldErrors, hasErrors } from "./validation";

/** Form state, client-side validation and submit for the auth screens. */
export function useAuthForm<T extends object>(
    initial: T,
    validate: (values: T) => FieldErrors<T>,
    submit: (values: T) => Promise<void>,
) {
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState<FieldErrors<T>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    function setField<K extends keyof T>(key: K, value: T[K]) {
        setValues((v) => ({ ...v, [key]: value }));
    }

    async function onSubmit() {
        const nextErrors = validate(values);
        setErrors(nextErrors);
        setFormError(null);
        if (hasErrors(nextErrors) || pending) return;
        setPending(true);
        try {
            await submit(values);
        } catch (err) {
            setFormError(authErrorMessage(err));
        } finally {
            setPending(false);
        }
    }

    return { values, errors, formError, pending, setField, onSubmit };
}
