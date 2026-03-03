"use client";

import { Button } from "@/components/ui/button";
import { enrollFreeCourseAction } from "@/actions/enrollments";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  priceCents: number;
  isEnrolled: boolean;
}

export function EnrollButton({
  courseId,
  courseSlug,
  priceCents,
  isEnrolled,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return (
      <Button
        className="w-full font-semibold"
        size="lg"
        onClick={() => router.push(`/learn/${courseSlug}`)}
      >
        Continue Learning
      </Button>
    );
  }

  if (priceCents === 0 || !priceCents) {
    return (
      <Button
        className="w-full font-semibold"
        size="lg"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await enrollFreeCourseAction(courseId);
            if (result.success) {
              toast.success("Enrolled successfully!");
              router.push(`/learn/${courseSlug}`);
            } else {
              toast.error(result.error || "Failed to enroll");
            }
          });
        }}
      >
        {isPending ? "Enrolling..." : "Enroll for Free"}
      </Button>
    );
  }

  // Paid course — Stripe checkout (Phase 4, coming later)
  return (
    <Button
      className="w-full font-semibold"
      size="lg"
      onClick={() => {
        toast.info("Payment integration coming soon!");
      }}
    >
      Enroll Now — ${(priceCents / 100).toFixed(2)}
    </Button>
  );
}
