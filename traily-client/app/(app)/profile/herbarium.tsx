import { PlaceholderScreen } from "@/components/placeholder-screen";

// 3.1 Herbier (TRA-42): build the screen in @/features/herbarium, then render it here.
export default function HerbariumScreen() {
    return (
        <PlaceholderScreen
            title="Herbier"
            story="3.1"
            links={[{ label: "Choisir une espèce", href: "/species/1" }]}
        />
    );
}
