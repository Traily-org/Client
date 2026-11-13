import { PlaceholderScreen } from "@/components/placeholder-screen";

// 1.2.3 Recherche (TRA-83): build the screen in @/features/trails, then render it here.
export default function SearchScreen() {
    return (
        <PlaceholderScreen
            title="Recherche"
            story="1.2.3"
            links={[{ label: "Choisir un résultat", href: "/trail/42" }]}
        />
    );
}
