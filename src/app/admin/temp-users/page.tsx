"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Loader2, Users as UsersIcon } from "lucide-react";
import { TempUser } from "@/types";

export default function TempUsersPage() {
  const [tempUsers, setTempUsers] = useState<TempUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTempUsers = async () => {
    try {
      const res = await fetch("/api/temp-users");
      if (!res.ok) throw new Error("Failed to fetch temp users");
      const data = await res.json();
      setTempUsers(data);
    } catch (err) {
      //console.error("[TempUsers] Failed to load:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTempUsers();
  }, []);

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/temp-users/${id}`, { method: "DELETE" });
      setTempUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Temporary Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Temporary accounts with limited search usage (10 credits each)
          </p>
        </div>
        <Link
          href="/admin/temp-users/create"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Temp User
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : tempUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No temporary users</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Create a temporary user to grant limited access
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage Credits
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tempUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {user.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.max(0, (user.usageCount / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.usageCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={deletingId === user.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
