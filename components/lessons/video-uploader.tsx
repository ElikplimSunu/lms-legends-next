"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { useState } from "react";
import { toast } from "sonner";
import { createUploadUrlAction } from "@/actions/video";
import { Video } from "lucide-react";

interface VideoUploaderProps {
  lessonId: string;
  courseId: string;
  onSuccess?: () => void;
}

export function VideoUploader({ lessonId, courseId, onSuccess }: VideoUploaderProps) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeUpload = async () => {
    setIsInitializing(true);
    const result = await createUploadUrlAction(lessonId, courseId);
    
    if (result.success && result.data) {
      setUploadUrl(result.data.url);
    } else if (!result.success) {
      toast.error(result.error || "Failed to initialize upload");
    }
    setIsInitializing(false);
  };

  if (!uploadUrl) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-transparent p-6 text-center dark:border-border flex flex-col items-center justify-center">
        <Video className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-1">Upload a video</h3>
        <p className="text-sm text-muted-foreground mb-4">Click below to start an upload</p>
        <button
            onClick={initializeUpload}
            disabled={isInitializing}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          {isInitializing ? "Preparing..." : "Select Video"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-background">
        <MuxUploader
            endpoint={uploadUrl}
            onSuccess={() => {
                toast.success("Video uploaded! Processing in background.");
                if (onSuccess) onSuccess();
            }}
            onUploadError={(error) => {
                toast.error("Video upload failed");
                console.error(error);
                setUploadUrl(null); // allow trying again
            }}
            className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-4 text-center">
            Upload progress is shown above. Please do not close this window until complete.
        </p>
    </div>
  );
}
