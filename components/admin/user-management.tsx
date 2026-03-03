"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserManagementProps {
  users: any[];
}

export function UserManagement({ users }: UserManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/users?${params.toString()}`);
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    instructor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    student:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left p-4 text-sm font-medium text-zinc-500">
                User
              </th>
              <th className="text-left p-4 text-sm font-medium text-zinc-500">
                Role
              </th>
              <th className="text-left p-4 text-sm font-medium text-zinc-500">
                Joined
              </th>
              <th className="text-left p-4 text-sm font-medium text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-sm">
                      {user.full_name || "—"}
                    </p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                      roleColors[user.role] || roleColors.student
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-zinc-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="text-xs text-emerald-600 font-medium">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
