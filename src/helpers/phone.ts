/**
 * Normalizes a Bangladesh phone number to a standard 11-digit format (01XXXXXXXXX).
 *
 * Handles international codes (+880, 880), non-numeric characters, 
 * and 10-digit formats (by adding a leading zero).
 *
 * @param phone - The raw phone number string to normalize.
 * @returns The normalized 11-digit phone number, or an empty string if input is empty.
 */
export function normalizePhoneNumber(phone: string): string {
    if (!phone) return "";
    
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("880")) {
        cleaned = cleaned.substring(2);
    }
    
    if (cleaned.length === 10 && !cleaned.startsWith("0")) {
        cleaned = "0" + cleaned;
    }

    return cleaned;
}


/**
 * Validates if a string is a valid Bangladesh phone number.
 *
 * A valid number must be exactly 11 digits, start with '01', and consist only of digits
 * after normalization.
 *
 * @param phone - The phone number string to validate.
 * @returns `true` if the phone number is valid, `false` otherwise.
 */
export function isValidBangladeshPhone(phone: string): boolean {
    const normalized = normalizePhoneNumber(phone);
    return /^01\d{9}$/.test(normalized);
}
