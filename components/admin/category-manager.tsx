"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderTree } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CategoryManagerProps {
  categories: unknown[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), slug }),
      });
      if (res.ok) {
        toast.success("Category created");
        setNewName("");
        router.refresh();
      } else {
        toast.error("Failed to create category");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New */}
      <div className="flex gap-2">
        <Input
          placeholder="New category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={isPending || !newName.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Category List */}
      <div className="bg-card text-card-foreground border border-border dark:border-border rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <FolderTree className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            No categories yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {categories.map((cat: unknown) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 dark:hover:bg-zinc-900/50"
              >
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
