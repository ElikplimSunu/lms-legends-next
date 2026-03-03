"use server";

import { createServerClient } from "@/lib/supabase/server";
import { ActionResult } from "@/types";

/**
 * Save the student's watch position for a lesson (debounced from client).
 */
export async function saveLessonProgressAction(
    lessonId: string,
    data: { last_position_seconds: number; watch_time_seconds: number }
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("lesson_progress").upsert(
        {
            user_id: user.id,
            lesson_id: lessonId,
            last_position_seconds: data.last_position_seconds,
            watch_time_seconds: data.watch_time_seconds,
        },
        {
            onConflict: "user_id,lesson_id",
        }
    );

    if (error) {
        console.error("Progress save error:", error);
        return { success: false, error: "Failed to save progress" };
    }

    return { success: true, data: undefined };
}

/**
 * Mark a lesson as completed.
 */
export async function markLessonCompleteAction(
    lessonId: string
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("lesson_progress").upsert(
        {
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
        },
        {
            onConflict: "user_id,lesson_id",
        }
    );

    if (error) {
        console.error("Complete error:", error);
        return { success: false, error: "Failed to mark complete" };
    }

    return { success: true, data: undefined };
}

/**
 * Get all lesson progress for a course (for the sidebar).
 */
export async function getCourseProgressAction(
    courseId: string
): Promise<ActionResult<unknown[]>> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: true, data: [] };
    }

    // Get all lessons in the course via modules
    const { data: modules } = await supabase
        .from("modules")
        .select("id, lessons(id)")
        .eq("course_id", courseId);

    if (!modules) {
        return { success: true, data: [] };
    }

    const lessonIds = modules.flatMap((m: { lessons?: { id: string }[] }) =>
        (m.lessons || []).map((l: { id: string }) => l.id)
    );

    if (lessonIds.length === 0) {
        return { success: true, data: [] };
    }

    const { data: progress } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

    return { success: true, data: progress || [] };
}
