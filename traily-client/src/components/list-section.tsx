import { Children, Fragment, type ReactNode } from "react";
import { Text, View } from "react-native";

import { uiClasses } from "@/constants/ui-classes";

interface ListSectionProps {
    /** Section title. Omit it for a standalone block, such as sign out. */
    title?: string;
    /** Rows of the section, usually {@link ListRow}. */
    children: ReactNode;
}

/** Card of rows under an optional title, with separators between rows. */
export function ListSection({ title, children }: ListSectionProps) {
    const rows = Children.toArray(children);

    return (
        <View className="gap-1.5">
            {title && (
                <Text
                    accessibilityRole="header"
                    className={`px-1 text-sm font-semibold ${uiClasses.textMuted}`}
                >
                    {title}
                </Text>
            )}
            {/* Shadow on the outer view: iOS clips it on a view with overflow hidden. */}
            <View className="rounded-2xl shadow-sm">
                <View
                    className={`overflow-hidden rounded-2xl ${uiClasses.surface}`}
                >
                    {rows.map((row, index) => (
                        <Fragment key={index}>
                            {index > 0 && (
                                <View
                                    className={`mx-4 h-px ${uiClasses.separator}`}
                                />
                            )}
                            {row}
                        </Fragment>
                    ))}
                </View>
            </View>
        </View>
    );
}
