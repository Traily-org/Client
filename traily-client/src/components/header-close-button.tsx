import { type Href, Link } from "expo-router";
import { Pressable, Text } from "react-native";

import { MIN_TOUCH_TARGET_CLASS, uiClasses } from "@/constants/ui-classes";

interface HeaderCloseButtonProps {
    /** Screen the modal was opened from: going back to it closes the modal. */
    href: Href;
}

/**
 * "Fermer" button for the header of a modal. iOS closes modals with a swipe
 * and Android with the back button, but the web needs this button.
 */
export function HeaderCloseButton({ href }: HeaderCloseButtonProps) {
    return (
        <Link href={href} dismissTo asChild>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                className={`${MIN_TOUCH_TARGET_CLASS} justify-center px-2`}
            >
                <Text className={`text-base ${uiClasses.text}`}>Fermer</Text>
            </Pressable>
        </Link>
    );
}
