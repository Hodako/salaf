declare module '@bangladeshi/bangladesh-address/build/src/index' {
    /**
     * Get all divisions in Bangladesh.
     */
    export function allDivision(): string[];

    /**
     * Get all districts within a specified division.
     */
    export function districtsOf(division: string): string[];

    /**
     * Get all upazila names within a specified district.
     */
    export function upazilaNamesOf(district: string): string[];
}
