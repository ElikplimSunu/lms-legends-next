"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLessonAction, reorderLessonsAction } from "@/actions/lessons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { LessonsList } from "./lessons-list";

interface LessonsFormProps {
  initialData: unknown[]; // Assuming any[] right now
  moduleId: string;
  courseId: string;
}

export function LessonsForm({ initialData, moduleId, courseId }: LessonsFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // We actually need to pass the courseId securely to the action
  // the bind method could work, but passing via hidden inputs is easier 
  // with native form submissions.
  // Wait, the createLessonAction requires `courseId` as the first param, let's look at its signature:
  // export async function createLessonAction(courseId: string, prevState: unknown, formData: FormData)
  const createLessonWithCourseId = createLessonAction.bind(null, courseId);
  const [state, action, isPending] = useActionState(createLessonWithCourseId, null);

  const toggleCreating = () => setIsCreating((prev) => !prev);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success("Lesson created successfully");
      toggleCreating();
      router.refresh();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      const res = await reorderLessonsAction(courseId, moduleId, updateData);
      if (res.success) {
        toast.success("Lessons reordered");
      } else if (!res.success && res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}/lessons/${id}`);
  };

  return (
    <div className="relative mt-6 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Module Lessons</h3>
        <Button onClick={toggleCreating} variant="ghost" size="sm">
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a lesson
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="module_id" value={moduleId} />
          <Input 
            name="title"
            disabled={isPending}
            placeholder="e.g. 'Overview of the tools'"
            autoFocus
          />
          <Button disabled={isPending} type="submit" size="sm">
            Create
          </Button>
        </form>
      )}

      {!isCreating && (
        <div className={`text-sm mt-2 ${!initialData.length ? "text-slate-500 italic" : ""}`}>
          {!initialData.length && "No lessons found."}
          
          {initialData.length > 0 && (
             <div className={`mt-4 ${isUpdating ? "opacity-50" : ""}`}>
                <LessonsList 
                  onEdit={onEdit}
                  onReorder={onReorder}
                  items={initialData || []}
                />
             </div>
          )}
        </div>
      )}
      
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the lessons
        </p>
      )}
    </div>
  );
}
