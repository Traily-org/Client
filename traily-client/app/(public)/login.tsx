import { PlaceholderScreen } from "@/components/placeholder-screen";

// Login (backend 8.1.3, TRA-94; front sub-issue to create): build the screen in @/features/auth, then render it here.
export default function LoginScreen() {
    return (
        <PlaceholderScreen
            title="Connexion"
            story="8.1.3"
            links={[
                { label: "Se connecter", href: "/", replace: true },
                { label: "Créer un compte", href: "/register" },
            ]}
        />
    );
}
