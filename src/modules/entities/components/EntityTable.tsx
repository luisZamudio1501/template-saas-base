"use client";

import { CrudList, type CrudColumn, type CrudRowAction } from "@/components/crud-list";
import { type Entity } from "../types";

// Column definitions are static — defined once, shared across all render cycles.
const COLUMNS: CrudColumn<Entity>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (item) => item.name,
  },
  {
    key: "description",
    header: "Descripción",
    render: (item) => item.description ?? "—",
  },
  {
    key: "status",
    header: "Estado",
    render: (item) => (item.status === "active" ? "Activo" : "Inactivo"),
  },
];

interface EntityTableProps {
  items: Entity[];
  loading: boolean;
  /** If omitted, the Edit action is not rendered. */
  onEdit?: (entity: Entity) => void;
  /** If omitted, the Delete action is not rendered. */
  onDelete?: (entity: Entity) => void;
}

export function EntityTable({ items, loading, onEdit, onDelete }: EntityTableProps) {
  const actions: CrudRowAction<Entity>[] = [
    ...(onEdit
      ? [{ key: "edit", label: "Editar", variant: "outline" as const, onClick: onEdit }]
      : []),
    ...(onDelete
      ? [{ key: "delete", label: "Eliminar", variant: "destructive" as const, onClick: onDelete }]
      : []),
  ];

  return (
    <CrudList
      items={items}
      columns={COLUMNS}
      actions={actions}
      loading={loading}
      emptyMessage="No se encontraron entidades."
      rowKey={(item) => item.id}
    />
  );
}
