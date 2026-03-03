import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | LMS Legends",
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get enrolled courses with progress
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      id, enrolled_at,
      courses (
        id, title, slug, thumbnail_url, description, short_description,
        modules (id, lessons (id))
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  // Get all lesson progress for the user
  const { data: allProgress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id)
    .eq("is_completed", true);

  const completedLessonIds = new Set(
    (allProgress || []).map((p: unknown) => p.lesson_id)
  );

  // Get certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(title)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })
    .limit(5);

  // Calculate per-course progress
  const coursesWithProgress = (enrollments || []).map((e: unknown) => {
    const course = e.courses;
    const allLessonIds = (course.modules || []).flatMap((m: { lessons?: { id: string }[] }) =>
      (m.lessons || []).map((l: { id: string }) => l.id)
    );
    const totalLessons = allLessonIds.length;
    const completedLessons = allLessonIds.filter((id: string) =>
      completedLessonIds.has(id)
    ).length;
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      ...course,
      totalLessons,
      completedLessons,
      progressPercent,
      enrolledAt: e.enrolled_at,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <p className="text-zinc-500 mt-1">
          Here&apos;s an overview of your learning progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coursesWithProgress.length}</p>
              <p className="text-sm text-zinc-500">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedLessonIds.size}</p>
              <p className="text-sm text-zinc-500">Lessons Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(certificates || []).length}
              </p>
              <p className="text-sm text-zinc-500">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
        {coursesWithProgress.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-zinc-500 mb-4">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithProgress.map((course: unknown) => (
              <Link
                key={course.id}
                href={`/learn/${course.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>{course.progressPercent}% complete</span>
                        <span>
                          {course.completedLessons}/{course.totalLessons}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Continue <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Certificates</h2>
          <div className="space-y-2">
            {certificates.map((cert: unknown) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
              >
                <div>
                  <p className="font-medium">
                    {(cert.courses as unknown)?.title}
                  </p>
                  <p className="text-sm text-zinc-500">
                    #{cert.certificate_number} ·{" "}
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
