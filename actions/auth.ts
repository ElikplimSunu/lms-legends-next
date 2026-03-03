"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ActionResult } from "@/types";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export async function loginAction(
    prevState: ActionResult<void> | null,
    formData: FormData
): Promise<ActionResult<void>> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validatedFields = loginSchema.safeParse({ email, password });

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.issues[0].message,
        };
    }

    const supabase = await createServerClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["student", "instructor"]),
});

export async function registerAction(
    prevState: ActionResult<void> | null,
    formData: FormData
): Promise<ActionResult<void>> {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const validatedFields = registerSchema.safeParse({ fullName, email, password, role });

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.issues[0].message,
        };
    }

    const supabase = await createServerClient();

    // 1. Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        }
    });

    if (signUpError) {
        return {
            success: false,
            error: signUpError.message,
        };
    }

    // If email confirmation is required, handle that here (Supabase handles it by default if enabled in dash).
    // Profiles trigger handle_new_user should have created the profile, now we should update it with the role.
    if (data.user) {
        // Service role or standard update since RLS allows updating own profile
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ role: role as "student" | "instructor" })
            .eq("id", data.user.id);

        if (profileError) {
            console.error("Error updating profile role:", profileError);
            // We don't fail the whole registration if this fails, but it's important.
        }
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function logoutAction(_formData?: FormData) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error", error);
    }

    revalidatePath("/", "layout");
    redirect("/login");
}

export async function resetPasswordAction(
    prevState: ActionResult<void> | null,
    formData: FormData
): Promise<ActionResult<void>> {
    const email = formData.get("email") as string;
    if (!email) {
        return { success: false, error: "Email is required" };
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
}

export async function updatePasswordAction(
    prevState: ActionResult<void> | null,
    formData: FormData
): Promise<ActionResult<void>> {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
    }

    if (password !== confirmPassword) {
        return { success: false, error: "Passwords do not match" };
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return { success: false, error: error.message };
    }

    redirect("/login");
}

export async function signInWithOAuthAction(provider: "google" | "github") {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }
}
