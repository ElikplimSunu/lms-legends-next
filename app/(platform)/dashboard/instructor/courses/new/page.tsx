import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "@/components/courses/create-course-form";

export const metadata = {
  title: "Create Course | LMS Legends",
};

export default async function NewCoursePage() {
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

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a New Course</h1>
        <p className="text-zinc-500 mt-2">
          Give your course a name and a basic description to get started. You can change these details later.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <CreateCourseForm />
      </div>
    </div>
  );
}
