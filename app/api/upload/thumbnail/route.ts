import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string;

    if (!file || !courseId) {
        return NextResponse.json({ error: "File and courseId required" }, { status: 400 });
    }

    // Verify user owns/is-admin for this course
    const { data: course } = await supabase
        .from("courses")
        .select("instructor_id")
        .eq("id", courseId)
        .single();

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (course.instructor_id !== user.id && profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `courses/${courseId}/thumbnail-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(fileName);

    // Update course record
    const { error: updateError } = await supabase
        .from("courses")
        .update({ thumbnail_url: publicUrl })
        .eq("id", courseId);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
}
