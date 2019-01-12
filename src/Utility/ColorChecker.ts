const COLOR_PROPER_REGEX = /^#[0-9A-Fa-f]{6}$/;
const COLOR_NOHASH_REGEX = /^[0-9A-Fa-f]{6}$/;
const COLOR_SHORT_REGEX = /^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/;
const FALLBACK_COLOR = '#FF69B4'; // Oh, cruelty!

export class ColorChecker {

    /**
     * Checks if a color string is in the correct format
     * @param color - The color specification to check
     * @returns a value indicating if the color is a valid #XXXXXX color or not
     */
    public static CheckColorFormat(color: string): boolean {
        if (color == null || color.length == 0) return false;

        if (color.match(COLOR_PROPER_REGEX)) return true;

        return false;
    }

    /**
     * Try hard to determine which color to use when faced with possibly malformed color values
     * (color picker standard *requires* color to be in #XXXXXX format).
     * @param originalColor - The original color value that we would prefer to use if possible
     * @param fallback - The fallback value to use if the original can't be used
     * @returns The best color to use, and pink if none can be used - to encourage changing it ASAP.
     */
    public static GetBestColorOption(originalColor: string, fallback: string): string {
        if (this.CheckColorFormat(originalColor)) return originalColor;

        if (originalColor == null || originalColor.length == 0) return this.GetBestColorOption(fallback, FALLBACK_COLOR);

        if (originalColor.match(COLOR_NOHASH_REGEX)) return "#" + originalColor;

        if (originalColor.match(COLOR_SHORT_REGEX)) return this.LongColorFromShort(originalColor);

        // Sorry, originalColor can't be used. We go with the fallback, or our default.

        return this.GetBestColorOption(fallback, FALLBACK_COLOR);
    }

    /**
     * Converts a color from short to proper long format
     * @param shortColor - The short color format input
     */
    public static LongColorFromShort(shortColor: string): string {
        let match = shortColor.match(COLOR_SHORT_REGEX);
        let a = match[1];
        let b = match[2];
        let c = match[3];

        return `#${a}${a}${b}${b}${c}${c}`;
    }
}