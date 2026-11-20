import { PlaceholderScreen } from "@/components/placeholder-screen";

// 2.3 Identification (TRA-41): build the screen in @/features/capture, then render it here.
export default function IdentifyScreen() {
    return (
        <PlaceholderScreen
            title="Identification"
            story="2.3"
            links={[
                { label: "Voir la fiche", href: "/species/1" },
                {
                    label: "Fin de l’identification",
                    href: "/",
                    dismissTo: true,
                },
            ]}
        />
    );
}
