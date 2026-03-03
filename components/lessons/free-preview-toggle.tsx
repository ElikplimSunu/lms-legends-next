"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLessonAction } from "@/actions/lessons";

interface FreePreviewToggleProps {
  lessonId: string;
  moduleId: string;
  courseId: string;
  initialValue: boolean;
}

export function FreePreviewToggle({
  lessonId,
  moduleId,
  courseId,
  initialValue,
}: FreePreviewToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("is_free_preview", String(!initialValue));

      const result = await updateLessonAction(lessonId, moduleId, courseId, null, formData);
      if (result.success) {
        toast.success(
          !initialValue
            ? "Lesson marked as free preview"
            : "Free preview removed"
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update");
      }
    });
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={initialValue ? true : false}
        onClick={handleToggle}
        disabled={isPending}
        className={`
          relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
          disabled:cursor-not-allowed disabled:opacity-50
          ${initialValue ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0
            transition-transform duration-200 ease-in-out
            ${initialValue ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
      <div>
        <p className="text-sm font-medium">Free Preview</p>
        <p className="text-xs text-zinc-500">
          {isPending
            ? "Saving..."
            : initialValue
            ? "This lesson is free for all visitors"
            : "Make this lesson available to non-enrolled users"}
        </p>
      </div>
    </label>
  );
}
