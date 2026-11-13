import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    type ListChoiceOption,
    ListChoiceRow,
} from "@/components/list-choice-row";
import { ListRow } from "@/components/list-row";
import { ListSection } from "@/components/list-section";
import { ListSwitchRow } from "@/components/list-switch-row";
import { uiClasses } from "@/constants/ui-classes";
import { MapModePicker } from "@/features/map";

/** Shown under the settings that are displayed but not wired yet. */
const NOT_WIRED = "Bientôt disponible";

const VISIBILITY_OPTIONS = [
    { value: "private", label: "Privé" },
    { value: "friends", label: "Amis" },
    { value: "public", label: "Public" },
] as const satisfies readonly ListChoiceOption<string>[];

/** Categories that follow the default visibility unless set on their own. */
const VISIBILITY_CATEGORIES = [
    {
        label: "Photos",
        icon: { ios: "camera.fill", material: "photo_camera" },
    },
    {
        label: "Collections",
        icon: { ios: "leaf.fill", material: "local_florist" },
    },
    {
        label: "Randonnées",
        icon: { ios: "figure.hiking", material: "hiking" },
    },
] as const;

const THEME_OPTIONS = [
    { value: "system", label: "Système" },
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
] as const satisfies readonly ListChoiceOption<string>[];

/** Settings screen, opened from the gear button of the map (TRA-127). */
export function SettingsScreen() {
    return (
        <SafeAreaView
            className={`flex-1 ${uiClasses.screen}`}
            edges={["bottom", "left", "right"]}
        >
            <ScrollView contentContainerClassName="gap-5 p-4">
                <ListSection title="Compte">
                    <Link href="/settings/personal-info" asChild>
                        <ListRow
                            label="Modifier mes informations"
                            description="Informations personnelles"
                            icon={{ ios: "person.fill", material: "person" }}
                            showChevron
                        />
                    </Link>
                </ListSection>

                {/* No story yet: default first, then per category, per item later with the community part. */}
                <ListSection title="Confidentialité">
                    <ListChoiceRow
                        label="Visibilité par défaut"
                        description={NOT_WIRED}
                        icon={{ ios: "eye.fill", material: "visibility" }}
                        options={VISIBILITY_OPTIONS}
                    />
                    {VISIBILITY_CATEGORIES.map((category) => (
                        <ListRow
                            key={category.label}
                            label={category.label}
                            icon={category.icon}
                            value="Par défaut"
                            showChevron
                            disabled
                        />
                    ))}
                </ListSection>

                {/* No ticket builds the notification system yet. */}
                <ListSection title="Notifications">
                    <ListSwitchRow
                        label="Notifications"
                        description={NOT_WIRED}
                        icon={{ ios: "bell.fill", material: "notifications" }}
                        value={false}
                    />
                </ListSection>

                {/* TRA-126 provides the light/dark mechanism to wire here. */}
                <ListSection title="Affichage">
                    <ListChoiceRow
                        label="Thème"
                        description={NOT_WIRED}
                        icon={{ ios: "moon.fill", material: "dark_mode" }}
                        options={THEME_OPTIONS}
                        value="system"
                    />
                </ListSection>

                <ListSection title="Carte">
                    {/* TODO(TRA-127): move to ListChoiceRow, with Lucas. */}
                    <View className="px-4 py-3">
                        <MapModePicker />
                    </View>
                    {/* Bonus feature 11.2 (TRA-75). */}
                    <ListSwitchRow
                        label="Afficher le compagnon"
                        description={NOT_WIRED}
                        icon={{ ios: "pawprint.fill", material: "pets" }}
                        value={false}
                    />
                </ListSection>

                <ListSection title="Informations">
                    <Link href="/settings/credits" asChild>
                        <ListRow
                            label="Crédits"
                            description="Fournisseurs des cartes"
                            icon={{ ios: "info.circle.fill", material: "info" }}
                            showChevron
                        />
                    </Link>
                    <Link href="/settings/onboarding" asChild>
                        <ListRow
                            label="Revoir l’onboarding éthique"
                            icon={{ ios: "leaf.circle.fill", material: "eco" }}
                            showChevron
                        />
                    </Link>
                </ListSection>

                <ListSection>
                    {/* TODO(8.1): clear the session before leaving. */}
                    <Link href="/login" replace asChild>
                        <ListRow label="Se déconnecter" tone="danger" />
                    </Link>
                </ListSection>
            </ScrollView>
        </SafeAreaView>
    );
}
