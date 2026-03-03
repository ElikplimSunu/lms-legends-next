"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCourseAction } from "@/actions/courses";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X } from "lucide-react";

interface DescriptionFormProps {
  initialData: {
    description: string | null;
  };
  courseId: string;
}

export function DescriptionForm({ initialData, courseId }: DescriptionFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialData.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateCourseAction(courseId, null, formData);

    if (result?.success) {
      toast.success(result.success);
      toggleEdit();
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Course Description</h3>
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
        <p className={`text-sm mt-2 ${!initialData.description ? "text-zinc-500 italic" : "text-zinc-600"}`}>
          {initialData.description || "No description provided."}
        </p>
      )}
      {isEditing && (
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Textarea 
            name="description"
            disabled={isSubmitting}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 'This course will teach you everything you need to know about Next.js 14...'"
            rows={4}
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
