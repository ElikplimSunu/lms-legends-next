import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { BookOpen, Lock, PlayCircle } from "lucide-react";
import { EnrollButton } from "@/components/courses/enroll-button";

// Helper to check if a string looks like a UUID
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createServerClient();

  const col = isUUID(courseId) ? "id" : "slug";
  const { data: course } = await supabase
    .from("courses")
    .select("title, short_description")
    .eq(col, courseId)
    .eq("status", "published")
    .single();

  return {
    title: course?.title
      ? `${course.title} | LMS Legends`
      : "Course | LMS Legends",
    description: course?.short_description || undefined,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const col = isUUID(courseId) ? "id" : "slug";
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      profiles!instructor_id (full_name, avatar_url),
      modules (
        *,
        lessons (*)
      )
    `
    )
    .eq(col, courseId)
    .eq("status", "published")
    .single();

  if (error || !course) redirect("/courses");

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .single();

  const isEnrolled = !!enrollment;

  // Sort
  course.modules?.sort((a: unknown, b: unknown) => a.sort_order - b.sort_order);
  course.modules?.forEach((mod: unknown) => {
    mod.lessons?.sort((a: unknown, b: unknown) => a.sort_order - b.sort_order);
  });

  const totalLessons =
    course.modules?.reduce(
      (acc: number, mod: unknown) => acc + (mod.lessons?.length || 0),
      0
    ) || 0;

  const instructor = course.profiles as unknown;

  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="bg-zinc-950 dark:bg-zinc-900 border-b border-zinc-800 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-zinc-400 text-lg line-clamp-3">
              {course.description || "No description provided."}
            </p>
            <div className="flex items-center gap-x-4 pt-4 flex-wrap">
              <div className="flex items-center gap-x-1 text-zinc-300">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span>{totalLessons} lessons</span>
              </div>
              {instructor && (
                <div className="text-zinc-400 text-sm">
                  By{" "}
                  <span className="text-zinc-200 font-medium">
                    {instructor.full_name}
                  </span>
                </div>
              )}
              {course.difficulty_level && (
                <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-800 text-zinc-300 capitalize">
                  {course.difficulty_level}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Card */}
          <div className="w-full md:w-80 lg:w-96 rounded-2xl bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl lg:-mb-32 z-10 sticky top-24">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-6">
              {course.thumbnail_url ? (
                <Image
                  fill
                  className="object-cover"
                  alt={course.title}
                  src={course.thumbnail_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  No Image
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                {course.price_cents === 0 || !course.price_cents
                  ? "Free"
                  : `$${(course.price_cents / 100).toFixed(2)}`}
              </h2>
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                priceCents={course.price_cents}
                isEnrolled={isEnrolled}
              />
              <p className="text-xs text-zinc-500 text-center">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-8 tracking-tight">
            Course Curriculum
          </h2>

          <div className="space-y-4">
            {course.modules?.map((module: unknown, index: number) => (
              <div
                key={module.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
              >
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-semibold text-lg">
                  <span>
                    Module {index + 1}: {module.title}
                  </span>
                  <span className="text-sm font-normal text-zinc-500">
                    {module.lessons?.length || 0} lessons
                  </span>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {module.lessons?.map((lesson: unknown) => (
                    <div
                      key={lesson.id}
                      className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition"
                    >
                      <div className="flex items-center gap-x-3">
                        {isEnrolled ? (
                          <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        ) : lesson.is_free_preview ? (
                          <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-400" />
                        )}
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                      {!isEnrolled && lesson.is_free_preview && (
                        <span className="text-xs font-semibold text-emerald-600 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-sm">
                          Preview
                        </span>
                      )}
                    </div>
                  ))}
                  {(!module.lessons || module.lessons.length === 0) && (
                    <div className="p-4 text-zinc-500 text-sm italic">
                      No lessons in this module.
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!course.modules || course.modules.length === 0) && (
              <div className="text-zinc-500 italic">
                No modules available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
