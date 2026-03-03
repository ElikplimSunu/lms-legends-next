"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResult } from "@/types";

const moduleSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    course_id: z.string().uuid("Invalid course"),
});

export async function createModuleAction(
    prevState: any,
    formData: FormData
): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const rawData = {
            title: formData.get("title"),
            course_id: formData.get("course_id"),
        };

        const validatedData = moduleSchema.parse(rawData);

        // Verify instructor owns the course
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("id", validatedData.course_id)
            .eq("instructor_id", user.id)
            .single();

        if (courseError || !course) {
            return { success: false, error: "Unauthorized or course not found" };
        }

        // Determine the next position (max position + 1)
        const { data: existingModules } = await supabase
            .from("modules")
            .select("position")
            .eq("course_id", validatedData.course_id)
            .order("position", { ascending: false })
            .limit(1);

        const position = existingModules && existingModules.length > 0
            ? existingModules[0].position + 1
            : 0;

        const { data: newModule, error } = await supabase
            .from("modules")
            .insert({
                title: validatedData.title,
                course_id: validatedData.course_id,
                position,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/instructor/courses/${validatedData.course_id}`);
        return { success: true, data: newModule };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateModuleAction(
    moduleId: string,
    courseId: string,
    prevState: any,
    formData: FormData
): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const title = formData.get("title");
        const is_published = formData.get("is_published");

        if (!title && is_published === null) {
            return { success: false, error: "Nothing to update" };
        }

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

        const updates: any = {};
        if (title) updates.title = title;
        if (is_published !== null) updates.is_published = is_published === "true";

        const { error, data } = await supabase
            .from("modules")
            .update(updates)
            .eq("id", moduleId)
            .eq("course_id", courseId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/instructor/courses/${courseId}`);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function reorderModulesAction(
    courseId: string,
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

    // Upsert positions
    // Supabase rpc or multiple updates
    // Since updateData is typically small, we can just do a loop of promises
    try {
        const promises = updateData.map((update) =>
            supabase
                .from("modules")
                .update({ position: update.position })
                .eq("id", update.id)
                .eq("course_id", courseId)
        );

        await Promise.all(promises);

        revalidatePath(`/dashboard/instructor/courses/${courseId}`);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: "Failed to reorder modules" };
    }
}

export async function deleteModuleAction(
    courseId: string,
    moduleId: string
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
        .from("modules")
        .delete()
        .eq("id", moduleId)
        .eq("course_id", courseId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/instructor/courses/${courseId}`);
    return { success: true, data: undefined };
}
