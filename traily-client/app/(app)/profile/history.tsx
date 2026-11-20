import { PlaceholderScreen } from "@/components/placeholder-screen";

// 3.4 Historique (TRA-63): build the screen in @/features/profile, then render it here.
export default function HistoryScreen() {
    return (
        <PlaceholderScreen
            title="Historique"
            story="3.4"
            links={[{ label: "Ouvrir une rando", href: "/trail/42" }]}
        />
    );
}
