import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LearnCourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch course and find the first lesson to redirect to
  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      id,
      modules (
        id, sort_order,
        lessons (id, sort_order)
      )
    `
    )
    .eq("slug", courseSlug)
    .single();

  if (!course) redirect("/courses");

  // Check enrollment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .single();

  // Find the user's last opened lesson or the first lesson
  const sortedModules = (course.modules || []).sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  let firstLessonId: string | null = null;
  for (const courseModule of sortedModules) {
    const sortedLessons = (courseModule.lessons || []).sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) => a.sort_order - b.sort_order
    );
    if (sortedLessons.length > 0) {
      firstLessonId = sortedLessons[0].id;
      break;
    }
  }

  if (firstLessonId) {
    redirect(`/learn/${courseSlug}/lessons/${firstLessonId}`);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">No lessons yet</h2>
        <p className="text-zinc-500">
          This course doesn&apos;t have any lessons yet.
        </p>
      </div>
    </div>
  );
}
