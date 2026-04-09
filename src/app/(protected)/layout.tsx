"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { appConfig, type NavItem } from "@/config/app";
import { LogoutButton } from "@/components/logout-button";

// Computed once at module load. Feature-flagged items are excluded.
const visibleNav = appConfig.navigation.filter(
  (item) => !item.feature || appConfig.features[item.feature]
);

function useIsActive(item: NavItem): boolean {
  const pathname = usePathname();
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// Separate component so each link can call useIsActive independently.
function NavLink({ item }: { item: NavItem }) {
  const active = useIsActive(item);
  return (
    <Link
      href={item.href}
      className={cn(
        "whitespace-nowrap text-sm no-underline transition-colors",
        active
          ? "font-medium text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
    >
      {item.label}
    </Link>
  );
}

// Auth is guaranteed by middleware — no client-side session check needed here.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                {appConfig.appName}
              </Link>

              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {visibleNav.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
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
