import { PlaceholderScreen } from "@/components/placeholder-screen";

// Register (backend 8.1.3, TRA-94; front sub-issue to create): build the screen in @/features/auth, then render it here.
export default function RegisterScreen() {
    return (
        <PlaceholderScreen
            title="Inscription"
            story="8.1.3"
            links={[
                { label: "Créer le compte", href: "/" },
                {
                    label: "J’ai déjà un compte",
                    href: "/login",
                    dismissTo: true,
                },
            ]}
        />
    );
}
