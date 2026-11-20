import { PlaceholderScreen } from "@/components/placeholder-screen";

// 7.3 Onboarding éthique (TRA-71): build the screen in @/features/onboarding, then render it here.
export default function OnboardingReplayScreen() {
    return (
        <PlaceholderScreen
            title="Onboarding éthique"
            story="7.3"
            links={[{ label: "Terminer", href: "/settings", dismissTo: true }]}
        />
    );
}
