"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

export async function createReviewAction(
    courseId: string,
    data: { rating: number; comment?: string }
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Verify enrollment
    const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single();

    if (!enrollment) {
        return { success: false, error: "You must be enrolled to leave a review" };
    }

    const { error } = await supabase.from("reviews").upsert(
        {
            user_id: user.id,
            course_id: courseId,
            rating: data.rating,
            comment: data.comment || null,
        },
        { onConflict: "user_id,course_id" }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/courses/${courseId}`);
    return { success: true, data: undefined };
}

export async function deleteReviewAction(
    reviewId: string
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
}
