import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { createServerClient } from "@/lib/supabase/server";

// Verify Mux Webhook Signatures
const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get("mux-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        // Attempt to verify the Webhook
        let event;
        try {
            event = mux.webhooks.unwrap(payload, req.headers as any, process.env.MUX_WEBHOOK_SIGNING_SECRET!);
        } catch (err: any) {
            console.error("Webhook Error:", err.message);
            return NextResponse.json({ error: "Webhook Error: " + err.message }, { status: 400 });
        }

        console.log(`[MUX WEBHOOK] Received event: ${event.type}`);

        // Handle specific events
        if (event.type === "video.asset.ready") {
            const asset = event.data as any; // Mux Asset object
            const passthrough = asset.passthrough;

            if (!passthrough) {
                console.log("No passthrough data, skipping.");
                return NextResponse.json({ message: "No passthrough" }, { status: 200 });
            }

            let parsedPassthrough;
            try {
                parsedPassthrough = JSON.parse(passthrough);
            } catch (e) {
                console.log("Invalid passthrough JSON, skipping.");
                return NextResponse.json({ message: "Invalid passthrough" }, { status: 200 });
            }

            const { lessonId } = parsedPassthrough;

            if (!lessonId) {
                console.log("No lessonId in passthrough, skipping.");
                return NextResponse.json({ message: "No lessonId" }, { status: 200 });
            }

            // To run a server client in a route handler safely outside the request lifecycle auth boundary,
            // we need a service role because the webhook is hitting us anonymously from Mux.
            // So let's use the service role key.
            const { createClient } = await import("@supabase/supabase-js");
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            console.log(`[MUX WEBHOOK] Setting lesson ${lessonId} to ready with asset ${asset.id}`);

            // We need to grab the playback ID to be able to stream it
            const playbackId = asset.playback_ids?.[0]?.id;

            const { error } = await supabaseAdmin
                .from("lessons")
                .update({
                    video_url: asset.id, // Store Mux Asset ID
                    mux_playback_id: playbackId,
                    mux_asset_id: asset.id,
                })
                .eq("id", lessonId);

            if (error) {
                console.error("Failed to update lesson with Mux details:", error);
                return NextResponse.json({ error: "DB Update Failed" }, { status: 500 });
            }

            return NextResponse.json({ success: true, message: "Asset ready handled" }, { status: 200 });
        }

        // Can handle video.asset.errored here as well if needed
        // if (event.type === "video.asset.errored") { ... }

        return NextResponse.json({ message: "Event ignored" }, { status: 200 });

    } catch (error) {
        console.error("Unhandled webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
