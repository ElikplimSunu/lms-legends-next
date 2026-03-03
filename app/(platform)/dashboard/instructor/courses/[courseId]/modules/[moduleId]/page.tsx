import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleTitleForm } from "@/components/modules/module-title-form";
import { LessonsForm } from "@/components/lessons/lessons-form";

export const metadata = {
  title: "Module Setup | LMS Legends",
};

export default async function ModuleSetupPage({
  params
}: {
  params: { courseId: string; moduleId: string }
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check instructor role & get module details
  const [profileResult, moduleResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("modules").select("*, lessons(*)").eq("id", params.moduleId).eq("course_id", params.courseId).single()
  ]);

  // Auth & ownership check
  if (profileResult.data?.role !== "instructor" || !moduleResult.data) {
    // Note: in a real, completely robust system, we should verify the course_id belongs to the instructor.
    // The modules query using the course_id ensures it belongs to the URL course, 
    // but the instructor_id check on the course itself is important. 
    // We can do another quick check.
    const courseCheck = await supabase.from("courses").select("id").eq("id", params.courseId).eq("instructor_id", user.id).single();
    if (!courseCheck.data) {
       redirect("/dashboard/instructor/courses");
    }
  } else if (profileResult.data?.role === "instructor" && moduleResult.data) {
      const courseCheck = await supabase.from("courses").select("id").eq("id", params.courseId).eq("instructor_id", user.id).single();
      if (!courseCheck.data) {
         redirect("/dashboard/instructor/courses");
      }
  }

  if(!moduleResult.data) {
      redirect(`/dashboard/instructor/courses/${params.courseId}`);
  }

  const courseModule = moduleResult.data;

  const requiredFields = [
    courseModule.title,
    // Add lesson count later
  ];
  
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
      <Link href={`/dashboard/instructor/courses/${params.courseId}`}>
        <Button variant="ghost" className="text-sm font-medium mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Setup
        </Button>
      </Link>

      <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Module Setup</h1>
          <span className="text-sm text-zinc-500">
            Complete all fields {completionText}
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <Button disabled={!isComplete} variant={courseModule.is_published ? "outline" : "default"}>
            {courseModule.is_published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-x-2 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Customize your module</h2>
            </div>
            
            <div className="space-y-6">
              <ModuleTitleForm 
                initialData={courseModule}
                courseId={params.courseId}
                moduleId={params.moduleId}
              />
            </div>

          </div>
        </div>
        
        <div className="space-y-8">
           <div>
            <div className="flex items-center gap-x-2 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <Settings className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Module Settings</h2>
            </div>

            {/* We can add access/drip settings here later */}
            <div className="rounded-xl border border-dashed border-zinc-200 bg-transparent p-6 text-center dark:border-zinc-800">
                <p className="text-sm text-zinc-500">No additional settings available yet.</p>
            </div>
           </div>

           <div>
               {/* Lessons Builder */}
               <h2 className="text-xl font-bold mb-6">Lessons</h2>
               <LessonsForm
                 initialData={courseModule.lessons.sort((a: any, b: any) => a.position - b.position)}
                 moduleId={params.moduleId}
                 courseId={params.courseId}
               />
           </div>
        </div>

      </div>
    </div>
  );
}
