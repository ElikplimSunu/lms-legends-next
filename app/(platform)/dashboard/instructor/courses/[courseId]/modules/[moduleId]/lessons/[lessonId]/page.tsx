import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Video, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LessonTitleForm } from "@/components/lessons/lesson-title-form";
import { LessonDescriptionForm } from "@/components/lessons/lesson-description-form";
import { VideoUploader } from "@/components/lessons/video-uploader";
import { VideoPlayer } from "@/components/lessons/video-player";

export const metadata = {
  title: "Lesson Setup | LMS Legends",
};

export default async function LessonSetupPage({
  params
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>
}) {
  const { courseId, moduleId, lessonId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the lesson directly
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*, modules(course_id)")
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    redirect(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`);
  }
  
  // Verify Ownership
  const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("instructor_id", user.id)
      .single();

  if (!course) {
    redirect("/dashboard/instructor/courses");
  }

  const requiredFields = [
    lesson.title,
    // Add video requirement later
  ];
  
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
      <Link href={`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`}>
        <Button variant="ghost" className="text-sm font-medium mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Module
        </Button>
      </Link>

      <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lesson Setup</h1>
          <span className="text-sm text-zinc-500">
            Complete all fields {completionText}
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <Button disabled={!isComplete} variant="default">
            Settings
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
              <h2 className="text-xl font-bold">Customize your lesson</h2>
            </div>
            
            <div className="space-y-6">
              <LessonTitleForm 
                initialData={lesson}
                moduleId={moduleId}
                courseId={courseId}
                lessonId={lessonId}
              />
              
              <LessonDescriptionForm 
                initialData={lesson}
                moduleId={moduleId}
                courseId={courseId}
                lessonId={lessonId}
              />
            </div>

          </div>
        </div>
        
        <div className="space-y-8">
           <div>
            <div className="flex items-center gap-x-2 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <Video className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Add a Video</h2>
            </div>

            {!lesson.video_url ? (
                <VideoUploader 
                  lessonId={lesson.id}
                  courseId={courseId}
                  onSuccess={() => {
                  }}
                />
            ) : (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    {lesson.mux_playback_id ? (
                        <VideoPlayer 
                          playbackId={lesson.mux_playback_id}
                          courseId={courseId}
                          lessonId={lessonId}
                        />
                    ) : (
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-md flex items-center justify-center">
                            <p className="text-zinc-500 text-sm">
                              Video uploaded, awaiting processing...
                            </p>
                        </div>
                    )}
                    
                    <div className="mt-4 text-sm text-zinc-500 flex justify-between">
                        <span>Status: {lesson.mux_playback_id ? "Ready" : "Processing"}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                            Replace Video
                        </Button>
                    </div>
                </div>
            )}
           </div>

           <div>
              <div className="flex items-center gap-x-2 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                  <Settings className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Access Settings</h2>
              </div>
              
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                 {/* Free preview toggle placeholder */}
                 <p className="text-sm font-medium">Free Preview</p>
                 <p className="text-xs text-zinc-500 mt-1">Check this box if you want to make this lesson free for preview.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
