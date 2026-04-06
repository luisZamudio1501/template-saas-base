"use client";

import { FormEvent, useState } from "react";
import { authService } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      await authService.resetPassword(email);

      setMessage("Revisá tu email para continuar con el reseteo de contraseña.");
    } catch (err: any) {
      setError(err.message || "Error al enviar el email de recuperación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Recuperar contraseña</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Enviar email de recuperación"}
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
