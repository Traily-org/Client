import { PlaceholderScreen } from "@/components/placeholder-screen";

// 1.2.1 Fin de rando (TRA-80): build the screen in @/features/hike-session, then render it here.
export default function HikeSummaryScreen() {
    return (
        <PlaceholderScreen
            title="Fin de rando"
            story="1.2.1"
            links={[{ label: "Sauvegarder", href: "/", dismissTo: true }]}
        />
    );
}
