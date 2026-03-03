import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              LMS Legends
            </span>
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Learn from the best, become a legend.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
