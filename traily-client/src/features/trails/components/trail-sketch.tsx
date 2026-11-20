import { View } from "react-native";

import { Icon } from "@/components/icon";

const PADDING = 9;
const DOT_SIZE = 2.5;
const DOT_GAP = 5;
const START_SIZE = 7;

interface TrailSketchProps {
    /** Route shape normalized to a 0-1 box, start first. */
    points: [number, number][];
    size: number;
    color: string;
}

/** Evenly spaced points along a polyline, `gap` px apart. */
function sampleAlong(points: [number, number][], gap: number) {
    const samples: [number, number][] = [];
    // Distance still to travel before the next sample, carried across
    // segments so the spacing stays even at corners.
    let carry = 0;
    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const length = Math.hypot(x1 - x0, y1 - y0);
        let at = carry;
        while (at < length) {
            const t = at / length;
            samples.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
            at += gap;
        }
        carry = at - length;
    }
    return samples;
}

/**
 * Hand-drawn style route sketch: a dotted line from a start dot to a cross
 * at the finish.
 */
export function TrailSketch({ points, size, color }: TrailSketchProps) {
    const inner = size - 2 * PADDING;
    const scaled = points.map(([x, y]): [number, number] => [
        PADDING + x * inner,
        PADDING + y * inner,
    ]);
    const [startX, startY] = scaled[0];
    const [endX, endY] = scaled[scaled.length - 1];
    // Leave room around both ends for their markers.
    const dots = sampleAlong(scaled, DOT_GAP).filter(
        ([x, y]) =>
            Math.hypot(x - startX, y - startY) > START_SIZE &&
            Math.hypot(x - endX, y - endY) > 7,
    );

    return (
        <View style={{ width: size, height: size }}>
            {dots.map(([x, y], index) => (
                <View
                    key={index}
                    style={{
                        position: "absolute",
                        left: x - DOT_SIZE / 2,
                        top: y - DOT_SIZE / 2,
                        width: DOT_SIZE,
                        height: DOT_SIZE,
                        borderRadius: DOT_SIZE / 2,
                        backgroundColor: color,
                    }}
                />
            ))}
            <View
                style={{
                    position: "absolute",
                    left: startX - START_SIZE / 2,
                    top: startY - START_SIZE / 2,
                    width: START_SIZE,
                    height: START_SIZE,
                    borderRadius: START_SIZE / 2,
                    borderWidth: 2,
                    borderColor: color,
                }}
            />
            <View
                style={{ position: "absolute", left: endX - 8, top: endY - 8 }}
            >
                <Icon ios="xmark" material="close" size={16} color={color} />
            </View>
        </View>
    );
}
