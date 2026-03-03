"use client";

import { useState, useRef, useTransition } from "react";
import { FileUp, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  lessonId: string;
  onUploaded?: (attachment: { name: string; url: string }) => void;
}

export function FileUpload({ lessonId, onUploaded }: FileUploadProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be less than 50MB");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      const res = await fetch("/api/upload/attachment", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploaded?.(data);
        toast.success("File uploaded");
      } else {
        toast.error("Upload failed");
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {isPending ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <FileUp className="w-4 h-4 mr-2" />
        )}
        {isPending ? "Uploading..." : "Add Attachment"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
