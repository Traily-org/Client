import { PlaceholderScreen } from "@/components/placeholder-screen";

// 3.4 Profil (TRA-63): build the screen in @/features/profile, then render it here.
export default function ProfileScreen() {
    return (
        <PlaceholderScreen
            title="Profil"
            story="3.4"
            links={[
                { label: "Mon herbier", href: "/profile/herbarium" },
                { label: "Historique", href: "/profile/history" },
            ]}
        />
    );
}
