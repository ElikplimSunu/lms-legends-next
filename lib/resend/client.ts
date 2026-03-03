import { Resend } from "resend";

/**
 * Resend client for sending transactional emails.
 * Used for welcome emails, purchase receipts, and certificate delivery.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default sender email address.
 */
export const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL ?? "noreply@lmslegends.com";
