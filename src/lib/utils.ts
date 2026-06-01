import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, resolving Tailwind CSS conflicts.
 * 
 * Uses `clsx` for conditional classes and `tailwind-merge` to ensure 
 * the final class list is clean and optimized.
 * 
 * @param inputs - A list of class values (strings, objects, arrays, etc.).
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escapes characters that have special meaning in regular expressions.
 * Used to safely query raw user inputs in MongoDB regex searches.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
