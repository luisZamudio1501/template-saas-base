export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-bold">Template Base V1</div>
          <nav className="flex gap-6 text-sm text-sidebar-foreground/70">
            <a href="/" className="hover:text-sidebar-foreground">
              Inicio
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-sidebar-border">
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-sidebar-foreground/50">
          Template Base V1 · Fábrica de Apps
        </div>
      </footer>
    </div>
  );
}