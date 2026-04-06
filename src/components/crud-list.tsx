"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface CrudColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

export interface CrudRowAction<T> {
  key: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  onClick: (item: T) => void;
}

interface CrudListProps<T> {
  items: T[];
  columns: CrudColumn<T>[];
  actions?: CrudRowAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: (item: T) => string;
  className?: string;
}

export function CrudList<T>({
  items,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "No hay registros.",
  rowKey,
  className,
}: CrudListProps<T>) {
  const hasActions = actions.length > 0;

  if (loading) {
    return (
      <div
        className={[
          "rounded-2xl border border-border bg-card px-6 py-5 text-base text-muted-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Cargando...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className={[
          "rounded-2xl border border-dashed border-border bg-card px-6 py-6 text-base text-muted-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-border bg-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[15px]">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    "px-6 py-4 text-left text-sm font-semibold text-foreground",
                    column.className,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {column.header}
                </th>
              ))}

              {hasActions && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={rowKey(item)}
                className="border-b border-border last:border-b-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={[
                      "px-6 py-4 align-middle text-foreground",
                      column.className,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.render(item)}
                  </td>
                ))}

                {hasActions && (
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {actions.map((action) => (
                        <Button
                          key={action.key}
                          type="button"
                          variant={action.variant ?? "outline"}
                          size="sm"
                          onClick={() => action.onClick(item)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}