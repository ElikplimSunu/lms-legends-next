"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLessonAction } from "@/actions/lessons";
import MDEditor from "@uiw/react-md-editor";

import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";

interface LessonDescriptionFormProps {
  initialData: {
    description: string | null;
  };
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export function LessonDescriptionForm({ initialData, courseId, moduleId, lessonId }: LessonDescriptionFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialData.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("description", description);

    const result = await updateLessonAction(lessonId, moduleId, courseId, null, formData);

    if (result?.success) {
      toast.success("Lesson description updated");
      toggleEdit();
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Lesson Description</h3>
        <Button onClick={toggleEdit} variant="ghost" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit description
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className={`mt-2 ${!initialData.description ? "text-muted-foreground italic text-sm" : ""}`}>
          {!initialData.description ? (
            "No description provided."
          ) : (
            <div data-color-mode="light" className="markdown-preview bg-transparent">
              <MDEditor.Markdown source={initialData.description} />
            </div>
          )}
        </div>
      )}
      {isEditing && (
        <div className="mt-4 space-y-4">
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || "")}
              height={300}
            />
          </div>
          <Button disabled={isSubmitting} onClick={onSubmit} size="sm">
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
