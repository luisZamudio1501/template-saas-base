import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-sidebar-foreground">
        Template Base V1
      </h1>

      <p className="mt-4 max-w-md text-base text-sidebar-foreground/60">
        Base reutilizable para construir aplicaciones SaaS. Incluye autenticación,
        layout protegido, módulos CRUD y sistema de notificaciones.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-sidebar-foreground px-5 py-2 text-sm font-medium text-sidebar transition-opacity hover:opacity-80"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-sidebar-border px-5 py-2 text-sm font-medium text-sidebar-foreground transition-opacity hover:opacity-80"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
