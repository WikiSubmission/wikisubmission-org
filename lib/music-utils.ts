
export function generateColors(id: string) {
    // Basic deterministic hue from string
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);

    return {
        card: `linear-gradient(135deg, hsl(${hue}, 30%, 20%), hsl(${(hue + 40) % 360}, 30%, 15%))`,
        art: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 70%, 40%))`,
        accent: `hsl(${hue}, 80%, 60%)`,
    };
}

export function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
