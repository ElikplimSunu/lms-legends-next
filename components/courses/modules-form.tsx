"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createModuleAction } from "@/actions/modules";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

import { reorderModulesAction } from "@/actions/modules";
import { ModulesList } from "./modules-list";

interface ModulesFormProps {
  initialData: unknown[]; // Using any[] for now before we lock down database types with Supabase CLI
  courseId: string;
}

export function ModulesForm({ initialData, courseId }: ModulesFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // We need to bind the courseId to our formData before it hits the action,
  // or pass it directly. Since createModuleAction expects FormData matching moduleSchema,
  // we'll just use a hidden input field.
  const [state, action, isPending] = useActionState(createModuleAction, null);

  const toggleCreating = () => setIsCreating((prev) => !prev);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success("Module created successfully");
      toggleCreating();
      router.refresh();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      const res = await reorderModulesAction(courseId, updateData);
      if (res.success) {
        toast.success("Modules reordered");
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
    router.push(`/dashboard/instructor/courses/${courseId}/modules/${id}`);
  };

  return (
    <div className="relative mt-6 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Course Modules</h3>
        <Button onClick={toggleCreating} variant="ghost" size="sm">
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a module
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="course_id" value={courseId} />
          <Input 
            name="title"
            disabled={isPending}
            placeholder="e.g. 'Introduction to the Course'"
            autoFocus
          />
          <Button disabled={isPending} type="submit" size="sm">
            Create
          </Button>
        </form>
      )}

      {!isCreating && (
        <div className={`text-sm mt-2 ${!initialData.length ? "text-slate-500 italic" : ""}`}>
          {!initialData.length && "No modules found. Add a module to start building your course."}
          {/* We will add a Drag and Drop list here shortly */}
          {initialData.length > 0 && (
             <div className={`mt-4 ${isUpdating ? "opacity-50" : ""}`}>
                <ModulesList 
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
          Drag and drop to reorder the modules
        </p>
      )}
    </div>
  );
}
