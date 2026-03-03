import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lessons/lesson-player";
import { generateMuxPlaybackToken } from "@/lib/mux/tokens";

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string; lessonId: string };
}) {
  const supabase = await createServerClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", params.lessonId)
    .single();

  return {
    title: lesson?.title
      ? `${lesson.title} | LMS Legends`
      : "Lesson | LMS Legends",
  };
}

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; lessonId: string };
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get lesson with module → course info
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      *,
      modules!inner (
        id, title,
        courses!inner (id, slug)
      ),
      lesson_attachments (*)
    `
    )
    .eq("id", params.lessonId)
    .single();

  if (error || !lesson) {
    redirect(`/learn/${params.courseSlug}`);
  }

  const courseId = (lesson.modules as any).courses.id;

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .single();

  const isEnrolled = !!enrollment;
  const isAccessible = isEnrolled || lesson.is_free_preview;

  if (!isAccessible) {
    redirect(`/courses/${courseId}`);
  }

  // Get user's progress for this lesson
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .single();

  // Generate signed playback token if we have a playback ID and signing keys
  let playbackToken: string | undefined;
  if (
    lesson.mux_playback_id &&
    process.env.MUX_SIGNING_KEY_ID &&
    process.env.MUX_SIGNING_PRIVATE_KEY
  ) {
    try {
      playbackToken = generateMuxPlaybackToken(lesson.mux_playback_id);
    } catch (err) {
      console.error("Failed to generate Mux playback token:", err);
    }
  }

  // Find next lesson
  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, sort_order")
    .eq("module_id", lesson.module_id)
    .order("sort_order");

  const currentIdx = (moduleLessons || []).findIndex(
    (l: any) => l.id === lesson.id
  );
  const nextLesson =
    moduleLessons && currentIdx < moduleLessons.length - 1
      ? moduleLessons[currentIdx + 1]
      : null;

  return (
    <LessonPlayer
      lesson={lesson}
      courseSlug={params.courseSlug}
      courseId={courseId}
      isEnrolled={isEnrolled}
      initialPosition={progress?.last_position_seconds || 0}
      isCompleted={progress?.is_completed || false}
      playbackToken={playbackToken}
      nextLessonId={nextLesson?.id}
      attachments={lesson.lesson_attachments || []}
    />
  );
}
