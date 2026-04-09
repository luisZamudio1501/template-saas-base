import { appConfig } from "@/config/app";

export default function DashboardPage() {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        Punto de entrada de {appConfig.appName}. Construí tu dashboard aquí.
      </p>
    </div>
  );
}
