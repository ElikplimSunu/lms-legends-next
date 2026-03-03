import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, PlayCircle, Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LearnCourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch course by slug
  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      id, title, slug,
      modules (
        id, title, sort_order,
        lessons (id, title, sort_order, is_free_preview, mux_playback_id)
      )
    `
    )
    .eq("slug", courseSlug)
    .single();

  if (!course) redirect("/courses");

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .single();

  const isEnrolled = !!enrollment;

  // Get progress
  const lessonIds = (course.modules || []).flatMap((m: { lessons?: { id: string }[] }) =>
    (m.lessons || []).map((l: { id: string }) => l.id)
  );

  let completedLessonIds = new Set<string>();
  if (isEnrolled && lessonIds.length > 0) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, is_completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds)
      .eq("is_completed", true);

    completedLessonIds = new Set(
      (progress || []).map((p: unknown) => p.lesson_id)
    );
  }

  // Sort
  const sortedModules = (course.modules || []).sort(
    (a: unknown, b: unknown) => a.sort_order - b.sort_order
  );
  sortedModules.forEach((m: unknown) => {
    m.lessons?.sort((a: unknown, b: unknown) => a.sort_order - b.sort_order);
  });

  const totalLessons = lessonIds.length;
  const completedCount = completedLessonIds.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-80 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
          <h2 className="font-semibold text-lg tracking-tight line-clamp-2">
            {course.title}
          </h2>
          {isEnrolled && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>{progressPercent}% complete</span>
                <span>
                  {completedCount}/{totalLessons}
                </span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sortedModules.map((module: unknown, idx: number) => (
            <div key={module.id} className="mb-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
                Module {idx + 1}: {module.title}
              </p>
              {module.lessons?.map((lesson: unknown) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isAccessible = isEnrolled || lesson.is_free_preview;

                return (
                  <Link
                    key={lesson.id}
                    href={
                      isAccessible
                        ? `/learn/${course.slug}/lessons/${lesson.id}`
                        : "#"
                    }
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                      isAccessible
                        ? "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isAccessible ? (
                      <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{lesson.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
