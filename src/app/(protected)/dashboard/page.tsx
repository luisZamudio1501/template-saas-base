import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Zona protegida funcionando correctamente.
          </p>
        </div>
      </div>

      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link href="/entities" className="text-sm text-primary hover:underline">
            Ir a Entities
          </Link>
          <Link href="/settings" className="text-sm text-primary hover:underline">
            Ir a Settings
          </Link>
          <Link href="/me" className="text-sm text-primary hover:underline">
            Ver usuario actual
          </Link>
        </div>
      </div>
    </div>
  );
}