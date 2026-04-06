export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
