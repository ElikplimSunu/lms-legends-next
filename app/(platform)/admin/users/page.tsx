import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/admin/user-management";

export const metadata = {
  title: "User Management | LMS Legends Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string };
}) {
  const supabase = await createServerClient();
  const { search, role } = searchParams;

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  const { data: users } = await query.limit(50);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      <UserManagement users={users || []} />
    </div>
  );
}
