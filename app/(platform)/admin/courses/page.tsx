import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";

export const metadata = {
  title: "Course Review | LMS Legends Admin",
};

export default async function AdminCoursesPage() {
  const supabase = await createServerClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, profiles!instructor_id(full_name, email)")
    .in("status", ["pending_review", "published", "archived"])
    .order("created_at", { ascending: false })
    .limit(50);

  const pending = (courses || []).filter((c: any) => c.status === "pending_review");
  const published = (courses || []).filter((c: any) => c.status === "published");

  const statusColors: Record<string, string> = {
    pending_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    archived: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    draft: "bg-zinc-50 text-zinc-500",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Course Review</h1>

      {/* Pending Reviews */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Review ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((course: any) => (
              <div
                key={course.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-zinc-500">
                    by {(course.profiles as any)?.full_name} ·{" "}
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Courses Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Courses</h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Title</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Instructor</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {(courses || []).map((course: any) => (
                <tr key={course.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="p-4 text-sm font-medium">{course.title}</td>
                  <td className="p-4 text-sm text-zinc-500">
                    {(course.profiles as any)?.full_name}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${statusColors[course.status] || ""}`}>
                      {course.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-500">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!courses || courses.length === 0) && (
            <div className="p-8 text-center text-zinc-500 text-sm">No courses found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
