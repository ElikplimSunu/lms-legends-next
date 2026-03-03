"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLessonAction, deleteLessonAction } from "@/actions/lessons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X } from "lucide-react";

interface LessonTitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export function LessonTitleForm({ initialData, courseId, moduleId, lessonId }: LessonTitleFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    
    const result = await updateLessonAction(lessonId, moduleId, courseId, null, formData);

    if (result?.success) {
      toast.success("Lesson updated");
      toggleEdit();
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  const onDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lesson? This cannot be undone.")) return;
    
    setIsSubmitting(true);
    const result = await deleteLessonAction(courseId, moduleId, lessonId);
    
    if (result?.success) {
      toast.success("Lesson deleted");
      router.push(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`);
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Lesson Title</h3>
        <div className="flex gap-2">
            <Button onClick={onDelete} disabled={isSubmitting} variant="destructive" size="sm" className="w-8 h-8 p-0">
               <Trash2 className="w-4 h-4" />
            </Button>
            <Button onClick={toggleEdit} variant="ghost" size="sm">
            {isEditing ? (
                <>
                <X className="h-4 w-4 mr-2" />
                Cancel
                </>
            ) : (
                <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit title
                </>
            )}
            </Button>
        </div>
      </div>
      {!isEditing && (
        <p className="text-sm text-muted-foreground mt-2">{initialData.title}</p>
      )}
      {isEditing && (
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Input 
            name="title"
            disabled={isSubmitting}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 'Introduction to the tools'"
            autoFocus
          />
          <Button disabled={isSubmitting} type="submit" size="sm">
            Save
          </Button>
        </form>
      )}
    </div>
  );
}
