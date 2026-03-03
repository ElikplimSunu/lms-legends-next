import { createServerClient } from "@/lib/supabase/server";
import { Users, BookOpen, DollarSign, GraduationCap } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | LMS Legends",
};

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  // KPI queries
  const [usersResult, coursesResult, enrollmentsResult, certificatesResult] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("enrollments").select("*", { count: "exact", head: true }),
      supabase.from("certificates").select("*", { count: "exact", head: true }),
    ]);

  // Recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Pending review courses
  const { data: pendingCourses } = await supabase
    .from("courses")
    .select("id, title, created_at, profiles!instructor_id(full_name)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(5);

  const kpis = [
    {
      label: "Total Users",
      value: usersResult.count || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Published Courses",
      value: coursesResult.count || 0,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Enrollments",
      value: enrollmentsResult.count || 0,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Certificates",
      value: certificatesResult.count || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-zinc-500">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Users</h2>
          <div className="space-y-3">
            {(recentUsers || []).map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{u.full_name || u.email}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded capitalize bg-zinc-100 dark:bg-zinc-900">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Course Reviews */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Pending Reviews</h2>
          {(!pendingCourses || pendingCourses.length === 0) ? (
            <p className="text-sm text-zinc-500">No courses pending review.</p>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map((c: any) => (
                <div key={c.id} className="text-sm">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-zinc-500">
                    by {(c.profiles as any)?.full_name} ·{" "}
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
