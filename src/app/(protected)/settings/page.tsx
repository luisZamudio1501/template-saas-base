"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authService } from "@/modules/auth";
import type { User } from "@/modules/auth/types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Cuenta</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="text-sm font-medium">{user?.email ?? "—"}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-base font-semibold">Seguridad</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Te enviaremos un email con un enlace para cambiar tu contraseña.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cambiar contraseña
        </Link>
      </div>
    </div>
  );
}
