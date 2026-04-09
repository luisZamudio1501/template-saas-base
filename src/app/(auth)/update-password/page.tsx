"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReadyState = "checking" | "ready" | "invalid";

function isRecoveryHash(): boolean {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  return hash.get("type") === "recovery" && !!hash.get("access_token");
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [readyState, setReadyState] = useState<ReadyState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificación inmediata del hash de la URL antes de que el SDK lo limpie.
    // Esta es la señal más directa y específica de contexto de recovery:
    // solo el link del email de Supabase incluye type=recovery en el hash.
    // Una sesión normal iniciada no tendrá este hash nunca.
    if (isRecoveryHash()) {
      setReadyState("ready");
    }

    // Respaldo: escucha el evento PASSWORD_RECOVERY para casos donde el SDK
    // procesó el hash antes del mount y ya lo limpió de la URL,
    // pero el evento llega aún después del efecto.
    const { data: { subscription } } = authService.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReadyState("ready");
      }
    });

    // Si tras 5 segundos ninguna vía resolvió, el link es inválido o no existe.
    const timeout = setTimeout(() => {
      setReadyState((current) => current === "checking" ? "invalid" : current);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      await authService.updatePassword(password);

      setMessage("Contraseña actualizada correctamente. Podés iniciar sesión.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  if (readyState === "checking") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">Verificando el link de recuperación...</p>
      </div>
    );
  }

  if (readyState === "invalid") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">Nueva contraseña</h1>
        <p className="text-sm text-destructive">
          El link de recuperación es inválido o expiró. Solicitá uno nuevo desde{" "}
          <a href="/forgot-password" className="underline">Recuperar contraseña</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Nueva contraseña</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </Button>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </form>
    </div>
  );
}
