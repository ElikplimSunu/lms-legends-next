import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

async function getAdminClient() {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function parseLessonId(passthrough: string | undefined): string | null {
    if (!passthrough) return null;
    try {
        const parsed = JSON.parse(passthrough);
        return parsed.lessonId || null;
    } catch {
        // passthrough might be a plain string lessonId
        return passthrough;
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get("mux-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        // Verify webhook signature (gracefully skip if no signing secret configured yet)
        let event: any;
        if (process.env.MUX_WEBHOOK_SIGNING_SECRET) {
            try {
                event = mux.webhooks.unwrap(payload, req.headers as any, process.env.MUX_WEBHOOK_SIGNING_SECRET);
            } catch (err: any) {
                console.error("[MUX WEBHOOK] Signature verification failed:", err.message);
                return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
            }
        } else {
            // No signing secret configured — accept the payload but log a warning
            console.warn("[MUX WEBHOOK] No MUX_WEBHOOK_SIGNING_SECRET set, skipping signature verification.");
            event = JSON.parse(payload);
        }

        console.log(`[MUX WEBHOOK] Event: ${event.type}`);

        const supabaseAdmin = await getAdminClient();

        // ──────────────────────────────────── video.asset.ready
        if (event.type === "video.asset.ready") {
            const asset = event.data;
            const lessonId = parseLessonId(asset.passthrough);

            if (!lessonId) {
                console.log("[MUX WEBHOOK] No lessonId in passthrough, skipping.");
                return NextResponse.json({ message: "No lessonId" }, { status: 200 });
            }

            const playbackId = asset.playback_ids?.[0]?.id;

            const { error } = await supabaseAdmin
                .from("lessons")
                .update({
                    mux_asset_id: asset.id,
                    mux_playback_id: playbackId,
                    mux_asset_status: "ready",
                    video_duration_seconds: asset.duration ?? null,
                })
                .eq("id", lessonId);

            if (error) {
                console.error("[MUX WEBHOOK] DB update failed:", error);
                return NextResponse.json({ error: "DB update failed" }, { status: 500 });
            }

            console.log(`[MUX WEBHOOK] Lesson ${lessonId} marked ready (playback: ${playbackId}, duration: ${asset.duration}s)`);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // ──────────────────────────────────── video.asset.errored
        if (event.type === "video.asset.errored") {
            const asset = event.data;
            const lessonId = parseLessonId(asset.passthrough);

            if (!lessonId) {
                return NextResponse.json({ message: "No lessonId" }, { status: 200 });
            }

            const { error } = await supabaseAdmin
                .from("lessons")
                .update({ mux_asset_status: "errored" })
                .eq("id", lessonId);

            if (error) {
                console.error("[MUX WEBHOOK] DB update failed for errored asset:", error);
            }

            console.log(`[MUX WEBHOOK] Lesson ${lessonId} marked errored`);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // ──────────────────────────────────── video.upload.asset_created (status: preparing)
        if (event.type === "video.upload.asset_created") {
            const upload = event.data;
            const lessonId = parseLessonId(upload.new_asset_settings?.passthrough || upload.passthrough);

            if (lessonId) {
                await supabaseAdmin
                    .from("lessons")
                    .update({ mux_asset_status: "preparing" })
                    .eq("id", lessonId);

                console.log(`[MUX WEBHOOK] Lesson ${lessonId} marked preparing`);
            }

            return NextResponse.json({ success: true }, { status: 200 });
        }

        return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    } catch (error) {
        console.error("[MUX WEBHOOK] Unhandled error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
