import { Pressable, Text, View } from "react-native";

import type { MapMode } from "./style/map-styles";

const OPTIONS: { mode: MapMode; label: string }[] = [
    { mode: "trail", label: "Sentier" },
    { mode: "satellite", label: "Satellite" },
    { mode: "topo", label: "Relief" },
];

export function MapModeSwitcher({
    mode,
    onChange,
}: {
    mode: MapMode;
    onChange: (mode: MapMode) => void;
}) {
    return (
        <View className="absolute bottom-6 right-4 flex-row rounded-[10px] bg-white/90 p-[3px] shadow-md">
            {OPTIONS.map((option) => {
                const active = option.mode === mode;
                return (
                    <Pressable
                        key={option.mode}
                        onPress={() => onChange(option.mode)}
                        className={`rounded-lg px-2.5 py-1.5 ${active ? "bg-[#e0733f]" : ""}`}
                    >
                        <Text
                            className={`text-xs font-semibold ${active ? "text-white" : "text-[#5c3b23]"}`}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
