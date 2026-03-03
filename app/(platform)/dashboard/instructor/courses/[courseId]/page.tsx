import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TitleForm } from "@/components/courses/title-form";
import { DescriptionForm } from "@/components/courses/description-form";
import { PriceForm } from "@/components/courses/price-form";
import { ModulesForm } from "@/components/courses/modules-form";
import { PublishButton } from "@/components/courses/publish-button";

export const metadata = {
  title: "Course Setup | LMS Legends",
};

export default async function CourseSetupPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check instructor role & get course details (now including modules)
  const [profileResult, courseResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("courses").select("*, categories(*), modules(*)").eq("id", courseId).eq("instructor_id", user.id).single()
  ]);

  if (profileResult.data?.role !== "instructor" || !courseResult.data) {
    redirect("/dashboard/instructor/courses");
  }

  const course = courseResult.data;

  const isPublished = course.status === 'published';

  // Let's determine how robust this course is before we let them publish it
  const requiredFields = [
    course.title,
    course.description,
    course.price_cents !== null,
  ];
  
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
      <Link href="/dashboard/instructor/courses">
        <Button variant="ghost" className="text-sm font-medium mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Course Setup</h1>
          <span className="text-sm text-zinc-500">
            Complete all fields {completionText}
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <PublishButton
            courseId={course.id}
            isPublished={isPublished}
            disabled={!isComplete}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-x-2 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Customize your course</h2>
            </div>
            
            <div className="space-y-6">
              <TitleForm initialData={course} courseId={course.id} />
              <DescriptionForm initialData={course} courseId={course.id} />
              <PriceForm initialData={course} courseId={course.id} />
            </div>

          </div>
        </div>
        
        <div className="space-y-8">
           <div>
            <div className="flex items-center gap-x-2 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <ListChecks className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Course Modules</h2>
            </div>
            
            <ModulesForm 
                initialData={course.modules.sort((a: any, b: any) => a.sort_order - b.sort_order)}
                courseId={course.id}
            />
           </div>
        </div>

      </div>
    </div>
  );
}
