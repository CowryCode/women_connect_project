"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Building2, Users, LogOut, Home, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">GBV Connect</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {session?.user?.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to App
          </Link>

          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider">
              Management
            </p>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Temp Users — SUPERADMIN only */}
          {session?.user?.role === "SUPERADMIN" && (
            <Link
              href="/admin/temp-users"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname.startsWith("/admin/temp-users")
                  ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <UserCog className="w-4 h-4" />
              Temp Users
            </Link>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
