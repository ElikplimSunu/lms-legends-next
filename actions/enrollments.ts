"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

/**
 * Enroll a user in a free course (instant enrollment, no Stripe).
 */
export async function enrollFreeCourseAction(
    courseId: string
): Promise<ActionResult> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify course exists, is published, and is free
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, price_cents, status")
        .eq("id", courseId)
        .single();

    if (courseError || !course) {
        return { success: false, error: "Course not found" };
    }

    if (course.status !== "published") {
        return { success: false, error: "Course is not available" };
    }

    if (course.price_cents > 0) {
        return { success: false, error: "This course requires payment" };
    }

    // Check if already enrolled
    const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

    if (existing) {
        return { success: false, error: "Already enrolled" };
    }

    const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        status: "active",
        price_paid_cents: 0,
    });

    if (error) {
        console.error("Enrollment error:", error);
        return { success: false, error: "Failed to enroll" };
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
}

/**
 * Check if a user is enrolled in a course.
 */
export async function checkEnrollmentAction(
    courseId: string
): Promise<ActionResult<{ enrolled: boolean; enrollmentId?: string }>> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: true, data: { enrolled: false } };
    }

    const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single();

    return {
        success: true,
        data: {
            enrolled: !!enrollment,
            enrollmentId: enrollment?.id,
        },
    };
}
