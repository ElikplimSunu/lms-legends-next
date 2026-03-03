"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

interface ThumbnailUploadProps {
  courseId: string;
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
}

export function ThumbnailUpload({ courseId, currentUrl, onUploaded }: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);

      const res = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPreview(data.url);
        onUploaded?.(data.url);
        toast.success("Thumbnail uploaded");
      } else {
        toast.error("Upload failed");
        setPreview(currentUrl || null);
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Course Thumbnail</label>
      <div
        className="relative group w-full aspect-video rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-900/50"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt="Thumbnail preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">Click to change</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-sm">Click to upload thumbnail</p>
            <p className="text-xs">PNG, JPG, WebP · Max 5MB</p>
          </div>
        )}

        {isPending && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
