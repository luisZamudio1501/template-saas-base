"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/modules/auth";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  function navClass(href: string) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    return cn(
      "whitespace-nowrap text-sm no-underline transition-colors",
      active
        ? "font-medium text-sidebar-foreground"
        : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
    );
  }

  useEffect(() => {
    async function checkUser() {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace("/login");
        } else {
          setAuthorized(true);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkUser();
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-sidebar-border bg-sidebar">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 sm:px-8 xl:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-8">
              <Link
                href="/dashboard"
                className="text-lg font-semibold text-sidebar-foreground no-underline"
              >
                App
              </Link>

              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link href="/dashboard" className={navClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/entities" className={navClass("/entities")}>
                  Entities
                </Link>
                <Link href="/settings" className={navClass("/settings")}>
                  Settings
                </Link>
              </nav>
            </div>

            <div className="flex justify-start md:justify-end">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 sm:py-10 xl:px-10">
        {children}
      </main>
    </div>
  );
}