import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookLock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Instructor Courses | LMS Legends",
};

export default async function InstructorCoursesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check instructor role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect("/dashboard");
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-zinc-500">Manage your course catalog here.</p>
        </div>
        <Link href="/dashboard/instructor/courses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses?.length === 0 ? (
          <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <BookLock className="h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="font-semibold">No courses yet</h3>
            <p className="text-sm text-zinc-500 mb-4">You haven&apos;t created any courses.</p>
            <Link href="/dashboard/instructor/courses/new">
              <Button variant="outline">Create your first course</Button>
            </Link>
          </div>
        ) : (
          courses?.map((course) => (
            <Link 
              key={course.id} 
              href={`/dashboard/instructor/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {course.title}
                  </h3>
                  {course.status === 'published' ? (
                    <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Published
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full dark:bg-amber-900/20 dark:text-amber-400">
                      {course.status === 'draft' ? 'Draft' : course.status === 'pending_review' ? 'Pending' : 'Archived'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2">
                  {course.description || "No description provided."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {course.price_cents ? `$${(course.price_cents / 100).toFixed(2)}` : 'Free'}
                </span>
                <span>
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
