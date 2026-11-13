import { Pressable, Text, View } from "react-native";

import { setMapMode, useMapMode } from "../hooks/use-map-mode";
import type { MapMode } from "../style/map-styles";

const OPTIONS: { mode: MapMode; label: string }[] = [
    { mode: "trail", label: "Sentier" },
    { mode: "satellite", label: "Satellite" },
    { mode: "topo", label: "Relief" },
];

/** Base map choice, shown in the settings. */
export function MapModePicker() {
    const mode = useMapMode();

    return (
        <View className="gap-2">
            <Text className="text-base font-semibold">Fond de carte</Text>
            <View className="flex-row self-start rounded-[10px] bg-gray-200 p-[3px]">
                {OPTIONS.map((option) => {
                    const active = option.mode === mode;
                    return (
                        <Pressable
                            key={option.mode}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: active }}
                            onPress={() => setMapMode(option.mode)}
                            className={`rounded-lg px-3 py-1.5 ${active ? "bg-[#e0733f]" : ""}`}
                        >
                            <Text
                                className={`text-sm font-semibold ${active ? "text-white" : "text-[#5c3b23]"}`}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
