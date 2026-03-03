"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCourseAction } from "@/actions/courses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X } from "lucide-react";

interface PriceFormProps {
  initialData: {
    price_cents: number | null;
  };
  courseId: string;
}

export function PriceForm({ initialData, courseId }: PriceFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const priceInDollars = initialData.price_cents !== null ? (initialData.price_cents / 100) : 0;
  const [price, setPrice] = useState(priceInDollars.toString());
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
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
      <div className="flex items-center justify-between font-medium">
        <h3 className="font-semibold mb-2">Course Price</h3>
        <Button onClick={toggleEdit} variant="ghost" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit price
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className="text-sm text-muted-foreground mt-2">
           {initialData.price_cents === 0 || initialData.price_cents === null ? "Free" : `$${(initialData.price_cents / 100).toFixed(2)}`}
        </p>
      )}
      {isEditing && (
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Input 
            name="price"
            type="number"
            min="0"
            step="0.01"
            disabled={isSubmitting}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">Set price to 0 to make it free.</p>
          <Button disabled={isSubmitting} type="submit" size="sm">
            Save
          </Button>
        </form>
      )}
    </div>
  );
}
