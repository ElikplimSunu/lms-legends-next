"use server";

import Mux from "@mux/mux-node";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ActionResult } from "@/types";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function createUploadUrlAction(
    lessonId: string,
    courseId: string
): Promise<ActionResult<{ url: string; uploadId: string }>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .eq("instructor_id", user.id)
        .single();

    if (!course) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ["signed"], // using signed tokens for secure playback
                passthrough: JSON.stringify({ lessonId, courseId }),
            },
            cors_origin: "*", // allow upload from our client
        });

        return {
            success: true,
            data: {
                url: upload.url,
                uploadId: upload.id
            }
        };
    } catch (error) {
        console.error("Mux upload error:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}
