import Mux from "@mux/mux-node";

/**
 * Mux API client singleton.
 * Used for creating uploads, managing assets, and generating tokens.
 */
export const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});
