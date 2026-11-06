import { PlaceholderScreen } from "@/components/placeholder-screen";

// 1.2.2 Fiche rando (TRA-81): build the screen in @/features/trails, then render it here.
export default function TrailScreen() {
    return (
        <PlaceholderScreen
            title="Fiche rando"
            story="1.2.2"
            links={[
                { label: "Lancer le parcours", href: "/", dismissTo: true },
                { label: "Choisir une espèce", href: "/species/1" },
            ]}
        />
    );
}
