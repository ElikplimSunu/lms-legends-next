"use server";

import { createServerClient } from "@/lib/supabase/server";
import { ActionResult } from "@/types";

/**
 * Issue a certificate for a user upon passing a course quiz.
 * Generates a unique certificate number.
 */
export async function issueCertificateAction(
    courseId: string
): Promise<ActionResult<{ certificateNumber: string }>> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Check enrollment
    const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single();

    if (!enrollment) {
        return { success: false, error: "Not enrolled in this course" };
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
        .from("certificates")
        .select("certificate_number")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

    if (existing) {
        return { success: true, data: { certificateNumber: existing.certificate_number } };
    }

    // Generate a unique certificate number: LMS-{timestamp}-{random}
    const certNumber = `LMS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { error } = await supabase.from("certificates").insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certNumber,
    });

    if (error) return { success: false, error: error.message };

    return { success: true, data: { certificateNumber: certNumber } };
}

/**
 * Get certificate data for rendering/verification.
 */
export async function getCertificateAction(certificateNumber: string) {
    const supabase = await createServerClient();

    const { data, error } = await supabase
        .from("certificates")
        .select("*, profiles!user_id(full_name, email), courses!course_id(title, slug)")
        .eq("certificate_number", certificateNumber)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        certificateNumber: data.certificate_number,
        issuedAt: data.issued_at,
        userName: (data.profiles as any)?.full_name || (data.profiles as any)?.email || "Student",
        courseTitle: (data.courses as any)?.title || "Course",
        courseSlug: (data.courses as any)?.slug,
    };
}
