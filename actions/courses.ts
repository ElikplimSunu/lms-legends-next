"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResult } from "@/types";

const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    description: z.string().optional(),
    category_id: z.string().uuid("Invalid category").optional().or(z.literal("")),
    price: z.coerce.number().min(0, "Price cannot be negative").default(0),
    is_published: z.boolean().default(false),
});

export async function createCourseAction(
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
            description: formData.get("description"),
            category_id: formData.get("category_id") || undefined,
            price: formData.get("price"),
        };

        const validatedData = courseSchema.parse(rawData);

        // Generate a basic slug (we can improve this later with a unique check)
        const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const { data: course, error } = await supabase
            .from("courses")
            .insert({
                ...validatedData,
                slug,
                instructor_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/instructor/courses");
        return {
            success: true,
            data: course
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateCourseAction(
    courseId: string,
    prevState: any,
    formData: FormData
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const rawData = {
            title: formData.get("title"),
            description: formData.get("description"),
            category_id: formData.get("category_id") || undefined,
            price: formData.get("price"),
            is_published: formData.get("is_published") === "on",
        };

        const validatedData = courseSchema.parse(rawData);

        const { error } = await supabase
            .from("courses")
            .update(validatedData)
            .eq("id", courseId)
            .eq("instructor_id", user.id); // Security: ensure they own it

        if (error) {
            return { success: false, error: error.message };
        }

        // Also revalidate the specific course page
        revalidatePath(`/dashboard/instructor/courses/${courseId}`);
        revalidatePath("/dashboard/instructor/courses");

        return { success: true, data: undefined };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteCourseAction(courseId: string): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId)
        .eq("instructor_id", user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/instructor/courses");
    return { success: true, data: undefined };
}
