export function formatDistance(km: number): string {
    return `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    return rest === 0
        ? `${hours} h`
        : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** Two-letter initials of a name, for an avatar without a photo. */
export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
}
