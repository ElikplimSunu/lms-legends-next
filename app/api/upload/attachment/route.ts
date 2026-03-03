import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const lessonId = formData.get("lessonId") as string;

        if (!file || !lessonId) {
            return NextResponse.json({ error: "File and lessonId required" }, { status: 400 });
        }

        // Verify lesson ownership
        const { data: lesson } = await supabase
            .from("lessons")
            .select("id, modules(courses(instructor_id))")
            .eq("id", lessonId)
            .single();

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        const instructorId = (lesson as unknown)?.modules?.courses?.instructor_id;
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (instructorId !== user.id && profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Upload to Supabase Storage
        const fileName = `lessons/${lessonId}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from("attachments")
            .getPublicUrl(fileName);

        // Determine file type from extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const mimeType = file.type || `application/${ext}`;

        // Insert attachment record
        const { data: attachment, error: insertError } = await supabase
            .from("lesson_attachments")
            .insert({
                lesson_id: lessonId,
                file_name: file.name,
                file_url: publicUrl,
                file_type: mimeType,
                file_size_bytes: file.size,
            })
            .select()
            .single();

        if (insertError) {
            console.error("DB insert error:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            name: file.name,
            url: publicUrl,
            id: attachment.id,
        });
    } catch (error) {
        console.error("Attachment upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
