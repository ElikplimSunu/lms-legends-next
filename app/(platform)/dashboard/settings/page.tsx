import { createServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch complete profile from public.profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl p-8">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Profile Settings</h3>
        <p className="text-sm text-zinc-500">
          Update your profile details and public avatar.
        </p>
      </div>
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
