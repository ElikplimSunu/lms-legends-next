"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

/**
 * Apply to become an instructor.
 */
export async function applyForInstructorAction(): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, instructor_status")
        .eq("id", user.id)
        .single();

    if (profile?.role === "instructor") {
        return { success: false, error: "Already an instructor" };
    }

    if (profile?.instructor_status === "pending") {
        return { success: false, error: "Application already pending" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ instructor_status: "pending" })
        .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
}

/**
 * Admin: Approve instructor application.
 */
export async function approveInstructorAction(userId: string): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify admin
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ role: "instructor", instructor_status: "approved" })
        .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/instructors");
    return { success: true, data: undefined };
}

/**
 * Admin: Reject instructor application.
 */
export async function rejectInstructorAction(userId: string): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ instructor_status: "rejected" })
        .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/instructors");
    return { success: true, data: undefined };
}
