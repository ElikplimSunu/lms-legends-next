import Stripe from "stripe";

/**
 * Server-side Stripe SDK instance.
 * Used for creating checkout sessions, managing connected accounts, and processing refunds.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

/**
 * Platform fee percentage taken from each course sale.
 * Configurable via environment variable, defaults to 15%.
 */
export const PLATFORM_FEE_PERCENT = Number(
    process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "15"
);
