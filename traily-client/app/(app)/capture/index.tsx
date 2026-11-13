import { PlaceholderScreen } from "@/components/placeholder-screen";

// 1.4 Caméra (TRA-60): build the screen in @/features/capture, then render it here.
export default function CameraScreen() {
    return (
        <PlaceholderScreen
            title="Caméra"
            story="1.4"
            links={[
                { label: "Prendre la photo", href: "/capture/identify" },
                { label: "Fermer", href: "/", dismissTo: true },
            ]}
        />
    );
}
