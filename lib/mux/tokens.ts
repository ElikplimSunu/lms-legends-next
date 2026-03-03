import jwt from "jsonwebtoken";

/**
 * Generates a signed playback token for Mux video streaming.
 * These tokens are short-lived (6 hours) and tied to a specific playback ID.
 *
 * @param playbackId - The Mux playback ID for the video asset
 * @returns A signed JWT string to pass to MuxPlayer's `tokens.playback`
 */
export function generateMuxPlaybackToken(playbackId: string): string {
    const signingKey = Buffer.from(
        process.env.MUX_SIGNING_PRIVATE_KEY!,
        "base64"
    );

    return jwt.sign(
        {
            sub: playbackId,
            aud: "v", // 'v' = video playback
            exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60, // 6 hours
            kid: process.env.MUX_SIGNING_KEY_ID!,
        },
        signingKey,
        { algorithm: "RS256" }
    );
}

/**
 * Generates a signed thumbnail token for Mux image thumbnails.
 *
 * @param playbackId - The Mux playback ID
 * @returns A signed JWT string for thumbnail access
 */
export function generateMuxThumbnailToken(playbackId: string): string {
    const signingKey = Buffer.from(
        process.env.MUX_SIGNING_PRIVATE_KEY!,
        "base64"
    );

    return jwt.sign(
        {
            sub: playbackId,
            aud: "t", // 't' = thumbnail
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
            kid: process.env.MUX_SIGNING_KEY_ID!,
        },
        signingKey,
        { algorithm: "RS256" }
    );
}
