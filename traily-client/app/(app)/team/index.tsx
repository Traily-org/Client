import { PlaceholderScreen } from "@/components/placeholder-screen";

// 5.1 Équipe (TRA-66): build the screen in @/features/teams, then render it here.
export default function TeamScreen() {
    return (
        <PlaceholderScreen
            title="Équipe"
            story="5.1"
            links={[{ label: "Classements", href: "/leaderboard" }]}
        />
    );
}
