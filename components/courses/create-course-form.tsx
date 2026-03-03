"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCourseAction } from "@/actions/courses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateCourseForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createCourseAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.success && state.data) {
      toast.success("Course created successfully");
      router.push(`/dashboard/instructor/courses/${state.data.id}`);
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="e.g. Advanced TypeScript Patterns" 
          required 
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          This will be the main heading on your course landing page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description (Optional)</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Briefly describe what students will learn..."
          rows={4}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input 
          id="price" 
          name="price" 
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00" 
          defaultValue="0"
          required 
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Set strictly to 0 to make the course free.
        </p>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
