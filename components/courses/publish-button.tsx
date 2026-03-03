"use client";

import { Button } from "@/components/ui/button";
import { toggleCoursePublishAction } from "@/actions/courses";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface PublishButtonProps {
  courseId: string;
  isPublished: boolean;
  disabled?: boolean;
}

export function PublishButton({
  courseId,
  isPublished,
  disabled,
}: PublishButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await toggleCoursePublishAction(courseId, !isPublished);
      if (result.success) {
        toast.success(
          isPublished
            ? "Course unpublished successfully"
            : "Course published successfully! 🎉"
        );
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <Button
      disabled={disabled || isPending}
      variant={isPublished ? "outline" : "default"}
      onClick={onClick}
    >
      {isPending
        ? "Saving..."
        : isPublished
        ? "Unpublish"
        : "Publish"}
    </Button>
  );
}
