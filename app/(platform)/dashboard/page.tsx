import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your LMS Legends Platform Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Welcome back to LMS Legends.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Placeholder cards for future development */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">My Courses</h3>
          <p className="text-sm text-zinc-500 mt-1">You have no active enrollments yet.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Certifications</h3>
          <p className="text-sm text-zinc-500 mt-1">Complete courses to earn certificates.</p>
        </div>
      </div>
    </div>
  );
}
