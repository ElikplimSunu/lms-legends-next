"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction, uploadAvatarAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Profile } from "@/types";

export function ProfileForm({ initialProfile }: { initialProfile: Partial<Profile> }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfileAction, null);
  const [avatarState, avatarAction, isAvatarPending] = useActionState(uploadAvatarAction, null);
  
  const avatarUrl = avatarState?.success ? avatarState.data.avatarUrl : (initialProfile.avatar_url || "");
  
  // Create a ref for the file input to trigger it programmatically
  const handleAvatarClick = () => {
    document.getElementById("avatar-upload")?.click();
  };

  useEffect(() => {
    if (profileState?.success) {
      toast.success("Profile updated successfully");
    } else if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState]);
  
  useEffect(() => {
    if (avatarState?.success) {
      toast.success("Avatar updated successfully");
    } else if (avatarState?.error) {
      toast.error(avatarState.error);
    }
  }, [avatarState]);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Avatar Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
        <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition" onClick={handleAvatarClick}>
          <AvatarImage src={avatarUrl} alt={initialProfile.full_name || "Avatar"} />
          <AvatarFallback className="text-xl">
            {initialProfile.full_name?.substring(0, 2).toUpperCase() || "LL"}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mb-4">Click the avatar or button below to upload a new one.</p>
          <form action={avatarAction} className="flex items-center space-x-2">
            <Input 
              id="avatar-upload" 
              name="file" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  e.target.form?.requestSubmit();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAvatarClick} 
              disabled={isAvatarPending}
            >
              {isAvatarPending ? "Uploading..." : "Change Avatar"}
            </Button>
          </form>
        </div>
      </div>

      {/* Profile Details Form */}
      <form action={profileAction} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              name="fullName" 
              defaultValue={initialProfile.full_name || ""} 
              required 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={initialProfile.email || ""} 
              disabled 
              className="bg-muted/50 dark:bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground">Your email address is managed via your account settings.</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              placeholder="Tell us a little bit about yourself" 
              defaultValue={initialProfile.bio || ""}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">Maximum 500 characters.</p>
          </div>
        </div>
        
        <Button type="submit" disabled={isProfilePending}>
          {isProfilePending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
