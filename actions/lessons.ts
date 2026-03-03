"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResult } from "@/types";

const lessonSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    module_id: z.string().uuid("Invalid module"),
});

export async function createLessonAction(
    courseId: string,
    prevState: unknown,
    formData: FormData
): Promise<ActionResult<unknown>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const rawData = {
            title: formData.get("title"),
            module_id: formData.get("module_id"),
        };

        const validatedData = lessonSchema.parse(rawData);

        // Verify ownership via course
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("id", courseId)
            .eq("instructor_id", user.id)
            .single();

        if (courseError || !course) {
            return { success: false, error: "Unauthorized or course not found" };
        }

        // Determine the next position (max position + 1)
        const { data: existingLessons } = await supabase
            .from("lessons")
            .select("sort_order")
            .eq("module_id", validatedData.module_id)
            .order("sort_order", { ascending: false })
            .limit(1);

        const sort_order = existingLessons && existingLessons.length > 0
            ? existingLessons[0].sort_order + 1
            : 0;

        const { data: newLesson, error } = await supabase
            .from("lessons")
            .insert({
                title: validatedData.title,
                module_id: validatedData.module_id,
                sort_order,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/instructor/courses/${courseId}/modules/${validatedData.module_id}`);
        return { success: true, data: newLesson };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateLessonAction(
    lessonId: string,
    moduleId: string,
    courseId: string,
    prevState: unknown,
    formData: FormData
): Promise<ActionResult<unknown>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const title = formData.get("title") as string | null;
        const description = formData.get("description") as string | null;
        const is_free_preview = formData.get("is_free_preview") as string | null;
        const video_url = formData.get("video_url") as string | null;

        // Verify ownership via course
        const { data: course } = await supabase
            .from("courses")
            .select("id")
            .eq("id", courseId)
            .eq("instructor_id", user.id)
            .single();

        if (!course) {
            return { success: false, error: "Unauthorized" };
        }

        const updates: Record<string, unknown> = {};
        if (title !== null) updates.title = title;
        if (description !== null) updates.description = description;
        if (is_free_preview !== null) updates.is_free_preview = is_free_preview === "true";
        if (video_url !== null) updates.video_url = video_url;

        // We don't update video details (Mux) directly this way, they come from webhooks usually, or a dedicated update method.

        const { error, data } = await supabase
            .from("lessons")
            .update(updates)
            .eq("id", lessonId)
            .eq("module_id", moduleId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function reorderLessonsAction(
    courseId: string,
    moduleId: string,
    updateData: { id: string; position: number }[]
): Promise<ActionResult> {
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
        const promises = updateData.map((update) =>
            supabase
                .from("lessons")
                .update({ sort_order: update.position })
                .eq("id", update.id)
                .eq("module_id", moduleId)
        );

        await Promise.all(promises);

        revalidatePath(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: "Failed to reorder lessons" };
    }
}

export async function deleteLessonAction(
    courseId: string,
    moduleId: string,
    lessonId: string
): Promise<ActionResult> {
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

    const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId)
        .eq("module_id", moduleId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`);
    return { success: true, data: undefined };
}
