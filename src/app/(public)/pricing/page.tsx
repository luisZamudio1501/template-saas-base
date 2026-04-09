"use client";

// =============================================================================
// Pricing page — public, no auth required to view.
// Replace PLANS with your real Stripe price IDs and copy when cloning.
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/modules/auth";
import { billingService } from "@/modules/billing/service";

// ─── Plans — edit this when cloning the template ─────────────────────────────
type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  /** Replace with real Stripe Price ID (e.g. price_1Abc...) */
  priceId: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Para proyectos personales y pequeños equipos",
    price: 9,
    currency: "USD",
    interval: "mes",
    priceId: "price_REPLACE_STARTER", // ← reemplazar al clonar
    features: [
      "Hasta 5 proyectos",
      "10 GB de almacenamiento",
      "Soporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para equipos en crecimiento",
    price: 29,
    currency: "USD",
    interval: "mes",
    priceId: "price_REPLACE_PRO", // ← reemplazar al clonar
    features: [
      "Proyectos ilimitados",
      "100 GB de almacenamiento",
      "Soporte prioritario",
      "Acceso a API",
    ],
    highlighted: true,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((user) => setIsAuthenticated(!!user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  async function handleSubscribe(plan: Plan) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoadingPlan(plan.id);
    setError(null);

    try {
      const { url } = await billingService.createCheckoutSession(plan.priceId);
      if (url) window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar el proceso de pago."
      );
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-sidebar-foreground">
          Planes y Precios
        </h1>
        <p className="mt-3 text-base text-sidebar-foreground/60">
          Elige el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      {error && (
        <p className="mb-6 text-center text-sm text-red-500">{error}</p>
      )}

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-xl border p-6",
              plan.highlighted
                ? "border-sidebar-foreground bg-sidebar-foreground text-sidebar"
                : "border-sidebar-border bg-sidebar/50 text-sidebar-foreground"
            )}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.highlighted
                    ? "text-sidebar/70"
                    : "text-sidebar-foreground/60"
                )}
              >
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span
                  className={cn(
                    "text-sm",
                    plan.highlighted
                      ? "text-sidebar/70"
                      : "text-sidebar-foreground/60"
                  )}
                >
                  / {plan.interval}
                </span>
              </div>
            </div>

            {/* Features */}
            <ul className="mb-8 flex flex-1 flex-col gap-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    plan.highlighted
                      ? "text-sidebar/90"
                      : "text-sidebar-foreground/80"
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4 shrink-0 opacity-70"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={
                loadingPlan === plan.id || isAuthenticated === null
              }
              className={cn(
                "w-full rounded-md px-4 py-2.5 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
                plan.highlighted
                  ? "bg-sidebar text-sidebar-foreground hover:opacity-90"
                  : "bg-sidebar-foreground text-sidebar hover:opacity-90"
              )}
            >
              {loadingPlan === plan.id
                ? "Redirigiendo..."
                : isAuthenticated === false
                ? "Iniciar sesión para suscribirse"
                : "Suscribirse"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-sidebar-foreground/40">
        Pagos procesados de forma segura por Stripe. Cancela cuando quieras.
      </p>
    </div>
  );
}
