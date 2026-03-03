"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResult } from "@/types";

const profileSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
});

export async function updateProfileAction(
    prevState: ActionResult<void> | null,
    formData: FormData
): Promise<ActionResult<void>> {
    const fullName = formData.get("fullName") as string;
    const bio = formData.get("bio") as string;

    const validatedFields = profileSchema.safeParse({ fullName, bio });

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.issues[0].message,
        };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: fullName,
            bio: bio || null,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data: undefined };
}

export async function uploadAvatarAction(
    prevState: ActionResult<{ avatarUrl: string }> | null,
    formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
        return { success: false, error: "Please select an image file." };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

    if (uploadError) {
        return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data: { avatarUrl: publicUrl } };
}
