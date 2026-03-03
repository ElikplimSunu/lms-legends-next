import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Instructor Applications | LMS Legends Admin",
};

export default async function AdminInstructorsPage() {
  const supabase = await createServerClient();

  const { data: pendingApplications } = await supabase
    .from("profiles")
    .select("*")
    .eq("instructor_status", "pending")
    .order("created_at", { ascending: false });

  const { data: approvedInstructors } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "instructor")
    .eq("instructor_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Instructor Applications
      </h1>

      {/* Pending */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Applications ({(pendingApplications || []).length})
        </h2>
        {(!pendingApplications || pendingApplications.length === 0) ? (
          <p className="text-zinc-500 text-sm">No pending applications.</p>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map((user: unknown) => (
              <div
                key={user.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{user.full_name || user.email}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                  {user.bio && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={`/api/admin/instructors/${user.id}/approve`} method="POST">
                    <Button size="sm" variant="default" type="submit">
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </form>
                  <form action={`/api/admin/instructors/${user.id}/reject`} method="POST">
                    <Button size="sm" variant="outline" type="submit">
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Instructors */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Approved Instructors</h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(approvedInstructors || []).map((inst: unknown) => (
                <tr key={inst.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="p-4 text-sm font-medium">{inst.full_name || "—"}</td>
                  <td className="p-4 text-sm text-zinc-500">{inst.email}</td>
                  <td className="p-4 text-sm text-zinc-500">
                    {new Date(inst.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!approvedInstructors || approvedInstructors.length === 0) && (
            <div className="p-8 text-center text-zinc-500 text-sm">No approved instructors yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
