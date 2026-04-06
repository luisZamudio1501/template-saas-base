"use client";

import { Button } from "@/components/ui/button";

interface EntityDeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  nombre?: string;
  error?: string | null;
}

export function EntityDeleteConfirm({
  open,
  onClose,
  onConfirm,
  loading,
  nombre,
  error,
}: EntityDeleteConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-base font-semibold">Eliminar registro</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          {nombre ? (
            <>
              ¿Confirmas que querés eliminar{" "}
              <span className="font-medium text-foreground">{nombre}</span>?
              Esta acción no se puede deshacer.
            </>
          ) : (
            "¿Confirmas que querés eliminar este registro? Esta acción no se puede deshacer."
          )}
        </p>

        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
