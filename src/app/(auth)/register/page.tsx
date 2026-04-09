"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { hasSession } = await authService.register(email, password);

      if (hasSession) {
        router.push("/dashboard");
      } else {
        setMessage("Cuenta creada correctamente. Revisá tu email y confirmá tu cuenta antes de ingresar.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error en registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Register</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Registrando..." : "Registrarse"}
        </Button>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </form>

      <div className="text-sm text-muted-foreground">
        <Link href="/login" className="underline">
          ¿Ya tenés cuenta? Ingresá
        </Link>
      </div>
    </div>
  );
}
