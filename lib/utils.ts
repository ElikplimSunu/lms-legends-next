import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price in cents to a human-readable currency string.
 * @example formatPrice(1999) // "$19.99"
 * @example formatPrice(0) // "Free"
 */
export function formatPrice(
  priceInCents: number,
  currency: string = "usd"
): string {
  if (priceInCents === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceInCents / 100);
}

/**
 * Generates a URL-safe slug from a string.
 * @example generateSlug("My Awesome Course!") // "my-awesome-course"
 */
export function generateSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

/**
 * Formats a duration in seconds to a human-readable string.
 * @example formatDuration(3661) // "1h 1m"
 * @example formatDuration(125) // "2m 5s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
