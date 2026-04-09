"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authService } from "@/modules/auth";
import type { User } from "@/modules/auth/types";

export default function MePage() {
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
      <h1 className="text-2xl font-semibold">Usuario actual</h1>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : user ? (
          <div className="flex flex-col gap-2 text-sm">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay usuario logueado.</p>
        )}
      </div>

      <Link href="/dashboard" className="text-sm text-primary hover:underline">
        ← Volver al dashboard
      </Link>
    </div>
  );
}
