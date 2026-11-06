import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import type { ColorValue } from "react-native";

interface IconProps {
    /** SF Symbol, used on iOS. */
    ios: SFSymbol;
    /** Material Symbol, used on Android and web. */
    material: AndroidSymbol;
    size?: number;
    color: ColorValue;
}

export function Icon({ ios, material, size = 24, color }: IconProps) {
    return (
        <SymbolView
            name={{ ios, android: material, web: material }}
            size={size}
            tintColor={color}
        />
    );
}
