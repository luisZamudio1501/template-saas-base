#!/usr/bin/env node
/**
 * scripts/generate-module.mjs
 *
 * Generates a complete CRUD module based on the entities pattern.
 *
 * Usage:
 *   node scripts/generate-module.mjs --name customers --label "Clientes"
 *   node scripts/generate-module.mjs --name invoices --label "Facturas" --singular invoice --label-singular "Factura"
 *
 * Arguments:
 *   --name            Module name, plural lowercase, letters/numbers/underscores
 *                     (e.g. customers, invoices, task_items)
 *   --label           Human-readable plural label (e.g. "Clientes")
 *   --singular        Override auto-singularized name  (e.g. "invoice")
 *   --label-singular  Override auto-singularized label (e.g. "Factura")
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Utilities ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      args[key] = next && !next.startsWith("--") ? argv[++i] : "true";
    }
  }
  return args;
}

function singularize(word) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (/([sxz]|[cs]h)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function toPascal(str) {
  return str
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function singularizeLabel(label) {
  if (label.endsWith("es")) return label.slice(0, -2);
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}

/** Replace {{token}} placeholders in a template string. */
function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Unknown template token: {{${key}}}`);
    return vars[key];
  });
}

function writeFile(absPath, content) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, "utf8");
  console.log(`  ✓  ${path.relative(ROOT, absPath)}`);
}

function nextMigrationNum() {
  const dir = path.join(ROOT, "supabase", "migrations");
  if (!fs.existsSync(dir)) return "0003";
  const files = fs.readdirSync(dir).filter((f) => /^\d{4}_/.test(f));
  if (!files.length) return "0001";
  const max = Math.max(...files.map((f) => parseInt(f.slice(0, 4), 10)));
  return String(max + 1).padStart(4, "0");
}

// ─── Argument validation ──────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));

if (!args.name || !args.label) {
  console.error("\nError: --name and --label are required.\n");
  console.error("Usage:");
  console.error(
    '  node scripts/generate-module.mjs --name customers --label "Clientes"\n'
  );
  process.exit(1);
}

const name = String(args.name).toLowerCase();

if (!/^[a-z][a-z0-9_]*$/.test(name)) {
  console.error(
    "\nError: --name must be lowercase letters, numbers, or underscores."
  );
  console.error("Examples: customers, invoices, task_items\n");
  process.exit(1);
}

if (["entities", "auth", "billing"].includes(name)) {
  console.error(`\nError: "${name}" is a reserved module name.\n`);
  process.exit(1);
}

const moduleDir = path.join(ROOT, "src", "modules", name);
if (fs.existsSync(moduleDir)) {
  console.error(`\nError: Module "${name}" already exists at src/modules/${name}/\n`);
  process.exit(1);
}

const label = String(args.label);
const singular = args.singular
  ? String(args.singular).toLowerCase()
  : singularize(name);
const labelSingular = args["label-singular"]
  ? String(args["label-singular"])
  : singularizeLabel(label);
const Pascal = toPascal(singular);
const Pascals = toPascal(name);
const UPPER = singular.toUpperCase().replace(/-/g, "_");
const PascalRepository = `${Pascal}Repository`;
const migNum = nextMigrationNum();

const v = {
  name,
  singular,
  Pascal,
  Pascals,
  UPPER,
  label,
  labelSingular,
  PascalRepository,
};

// ─── Templates ───────────────────────────────────────────────────────────────

const TYPES = `export type {{Pascal}}Status = "active" | "inactive";

export interface {{Pascal}} {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: {{Pascal}}Status;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create{{Pascal}}Input {
  name: string;
  description?: string | null;
  status?: {{Pascal}}Status;
}

export interface Update{{Pascal}}Input {
  name?: string;
  description?: string | null;
  status?: {{Pascal}}Status;
}

export interface {{Pascal}}Filters {
  search?: string;
  status?: "all" | {{Pascal}}Status;
}
`;

const SCHEMAS = `import { z } from "zod";

// ---------------------------------------------------------------------------
// Form schema — client side, used by React hooks.
// ---------------------------------------------------------------------------
export const {{singular}}FormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type {{Pascal}}FormValues = z.infer<typeof {{singular}}FormSchema>;

// ---------------------------------------------------------------------------
// API schemas — server side, used by Route Handlers.
// ---------------------------------------------------------------------------
export const create{{Pascal}}Schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type Create{{Pascal}}Body = z.infer<typeof create{{Pascal}}Schema>;

export const update{{Pascal}}Schema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type Update{{Pascal}}Body = z.infer<typeof update{{Pascal}}Schema>;
`;

// Note: backtick template expressions inside generated TS files are escaped below.
const REPOSITORY = `// Data access layer for the {{name}} module.
// This is the only file that knows about Supabase queries for {{name}}.
// Never import this from client/browser code.

import { createSupabaseServer } from "@/lib/supabase/server";
import {
  {{Pascal}},
  {{Pascal}}Status,
  Create{{Pascal}}Input,
  Update{{Pascal}}Input,
  {{Pascal}}Filters,
} from "./types";

// ─── Internal row type (DB shape) ────────────────────────────────────────────

type {{Pascal}}Row = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: {{Pascal}}Status;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const {{UPPER}}_SELECT =
  "id, user_id, name, description, status, created_at, updated_at, deleted_at" as const;

function mapRow(row: {{Pascal}}Row): {{Pascal}} {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function findAllByUser(
  userId: string,
  filters?: Pick<{{Pascal}}Filters, "search" | "status">
): Promise<{{Pascal}}[]> {
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("{{name}}")
    .select({{UPPER}}_SELECT)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.ilike("name", \`%\${filters.search}%\`);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data as {{Pascal}}Row[]).map(mapRow);
}

export async function findByIdForUser(
  id: string,
  userId: string
): Promise<{{Pascal}} | null> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("{{name}}")
    .select({{UPPER}}_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapRow(data as {{Pascal}}Row);
}

export async function findByNameForUser(
  name: string,
  userId: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("{{name}}")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", name)
    .is("deleted_at", null)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []).length > 0;
}

export async function createForUser(
  userId: string,
  input: Create{{Pascal}}Input
): Promise<{{Pascal}}> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("{{name}}")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "active",
    })
    .select({{UPPER}}_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return mapRow(data as {{Pascal}}Row);
}

export async function updateForUser(
  id: string,
  userId: string,
  input: Update{{Pascal}}Input
): Promise<{{Pascal}} | null> {
  const supabase = await createSupabaseServer();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    payload.name = input.name;
  }
  if (input.description !== undefined) {
    payload.description = input.description || null;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }

  const { data, error } = await supabase
    .from("{{name}}")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select({{UPPER}}_SELECT)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapRow(data as {{Pascal}}Row);
}

export async function softDeleteForUser(
  id: string,
  userId: string
): Promise<void> {
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("{{name}}")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
}
`;

const SERVICE = `// Client-side service for the {{name}} module.
// All Supabase access happens server-side via Route Handlers.
// This service only talks to /api/{{name}} over HTTP.

import {
  {{Pascal}},
  Create{{Pascal}}Input,
  Update{{Pascal}}Input,
  {{Pascal}}Filters,
} from "./types";

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (body as { error?: string }).error ?? \`Error \${response.status}\`
    );
  }

  return response.json() as Promise<T>;
}

export const {{name}}Service = {
  async getAll(filters?: {{Pascal}}Filters): Promise<{{Pascal}}[]> {
    const params = new URLSearchParams();
    const search = filters?.search?.trim();
    if (search) params.set("search", search);
    if (filters?.status && filters.status !== "all") {
      params.set("status", filters.status);
    }
    const qs = params.toString();
    return apiFetch<{{Pascal}}[]>(\`/api/{{name}}\${qs ? \`?\${qs}\` : ""}\`);
  },

  async getById(id: string): Promise<{{Pascal}} | null> {
    try {
      return await apiFetch<{{Pascal}}>(\`/api/{{name}}/\${id}\`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async create(input: Create{{Pascal}}Input): Promise<{{Pascal}}> {
    return apiFetch<{{Pascal}}>("/api/{{name}}", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: Update{{Pascal}}Input): Promise<{{Pascal}}> {
    return apiFetch<{{Pascal}}>(\`/api/{{name}}/\${id}\`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(\`/api/{{name}}/\${id}\`, { method: "DELETE" });
  },
};
`;

const INDEX = `export { {{name}}Service } from "./service";
export type {
  {{Pascal}},
  {{Pascal}}Status,
  Create{{Pascal}}Input,
  Update{{Pascal}}Input,
  {{Pascal}}Filters,
} from "./types";
`;

const HOOK_LIST = `import { useState, useEffect, useCallback } from "react";
import { {{name}}Service } from "../service";
import { {{Pascal}}, {{Pascal}}Filters } from "../types";

interface Use{{Pascals}}Return {
  data: {{Pascal}}[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function use{{Pascals}}(filters?: {{Pascal}}Filters): Use{{Pascals}}Return {
  const [data, setData] = useState<{{Pascal}}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = filters?.search;
  const status = filters?.status;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await {{name}}Service.getAll({ search, status });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los registros.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
`;

const HOOK_FORM = `import { useEffect, useState } from "react";
import { {{name}}Service } from "../service";
import { {{Pascal}} } from "../types";
import { {{singular}}FormSchema, type {{Pascal}}FormValues } from "../schemas";
import { toast } from "@/hooks/use-toast";

export type { {{Pascal}}FormValues };

const EMPTY_VALUES: {{Pascal}}FormValues = { name: "", description: "", status: "active" };

function toFormValues(item?: {{Pascal}}): {{Pascal}}FormValues {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "active",
  };
}

interface Use{{Pascal}}FormOptions {
  initialValues?: {{Pascal}};
  onSuccess?: (item: {{Pascal}}) => void;
}

interface Use{{Pascal}}FormReturn {
  values: {{Pascal}}FormValues;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isEditing: boolean;
  setField: <K extends keyof {{Pascal}}FormValues>(key: K, value: {{Pascal}}FormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function use{{Pascal}}Form(options: Use{{Pascal}}FormOptions): Use{{Pascal}}FormReturn {
  const { initialValues, onSuccess } = options;

  const isEditing = !!initialValues;

  const [values, setValues] = useState<{{Pascal}}FormValues>(() => toFormValues(initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const itemId = initialValues?.id;
  useEffect(() => {
    setValues(toFormValues(initialValues));
    setError(null);
    setValidationError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  function setField<K extends keyof {{Pascal}}FormValues>(key: K, value: {{Pascal}}FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setValidationError(null);
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setError(null);
    setValidationError(null);
  }

  async function submit() {
    const parsed = {{singular}}FormSchema.safeParse(values);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setValidationError(first?.message ?? "Error de validación.");
      return;
    }

    const { name, description, status } = parsed.data;

    setLoading(true);
    setError(null);

    try {
      let saved: {{Pascal}};

      if (isEditing && initialValues) {
        saved = await {{name}}Service.update(initialValues.id, {
          name,
          description: description || null,
          status,
        });
      } else {
        saved = await {{name}}Service.create({
          name,
          description: description || null,
          status,
        });
        setValues(EMPTY_VALUES);
      }

      toast.success(
        isEditing
          ? "{{labelSingular}} actualizado correctamente."
          : "{{labelSingular}} creado correctamente."
      );
      onSuccess?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el registro.");
    } finally {
      setLoading(false);
    }
  }

  return { values, loading, error, validationError, isEditing, setField, submit, reset };
}
`;

const HOOK_DELETE = `import { useState } from "react";
import { {{name}}Service } from "../service";

interface Use{{Pascal}}DeleteOptions {
  onSuccess?: () => void;
}

interface Use{{Pascal}}DeleteReturn {
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
}

export function use{{Pascal}}Delete(
  options: Use{{Pascal}}DeleteOptions = {}
): Use{{Pascal}}DeleteReturn {
  const { onSuccess } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setLoading(true);
    setError(null);

    try {
      await {{name}}Service.remove(id);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el registro.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, remove };
}
`;

const COMPONENT_FORM = `"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { type {{Pascal}}FormValues } from "../hooks/use{{Pascal}}Form";

interface {{Pascal}}FormProps {
  values: {{Pascal}}FormValues;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isEditing: boolean;
  setField: <K extends keyof {{Pascal}}FormValues>(key: K, value: {{Pascal}}FormValues[K]) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function {{Pascal}}Form({
  values,
  loading,
  error,
  validationError,
  isEditing,
  setField,
  onSubmit,
  onCancel,
}: {{Pascal}}FormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar {{labelSingular}}" : "Nueva {{labelSingular}}"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Modificá nombre, descripción y estado."
            : "Completá los campos para crear un registro."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
        <FormField label="Nombre" required error={validationError}>
          <Input
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Nombre del registro"
            disabled={loading}
          />
        </FormField>

        <FormField label="Descripción">
          <textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Descripción opcional"
            disabled={loading}
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
        </FormField>

        <FormField label="Estado">
          <select
            value={values.status}
            onChange={(e) =>
              setField("status", e.target.value as {{Pascal}}FormValues["status"])
            }
            disabled={loading}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </FormField>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
`;

const COMPONENT_TABLE = `"use client";

import { CrudList, type CrudColumn, type CrudRowAction } from "@/components/crud-list";
import { type {{Pascal}} } from "../types";

const COLUMNS: CrudColumn<{{Pascal}}>[] = [
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

interface {{Pascal}}TableProps {
  items: {{Pascal}}[];
  loading: boolean;
  onEdit?: (item: {{Pascal}}) => void;
  onDelete?: (item: {{Pascal}}) => void;
}

export function {{Pascal}}Table({ items, loading, onEdit, onDelete }: {{Pascal}}TableProps) {
  const actions: CrudRowAction<{{Pascal}}>[] = [
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
      emptyMessage="No se encontraron {{name}}."
      rowKey={(item) => item.id}
    />
  );
}
`;

const COMPONENT_DELETE_CONFIRM = `"use client";

import { Button } from "@/components/ui/button";

interface {{Pascal}}DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  nombre?: string;
  error?: string | null;
}

export function {{Pascal}}DeleteConfirm({
  open,
  onClose,
  onConfirm,
  loading,
  nombre,
  error,
}: {{Pascal}}DeleteConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!loading ? onClose : undefined}
      />
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
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
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
`;

const API_ROUTE = `import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { create{{Pascal}}Schema } from "@/modules/{{name}}/schemas";
import * as {{PascalRepository}} from "@/modules/{{name}}/repository";

// GET /api/{{name}}
// Query params: search (string), status ("active" | "inactive")
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim() || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const items = await {{PascalRepository}}.findAllByUser(user.id, {
      search,
      status: status as "active" | "inactive" | undefined,
    });
    return NextResponse.json(items);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/{{name}}
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON válido." },
      { status: 422 }
    );
  }

  const parsed = create{{Pascal}}Schema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  try {
    const nameExists = await {{PascalRepository}}.findByNameForUser(parsed.data.name, user.id);
    if (nameExists) {
      return NextResponse.json(
        { error: "Ya existe un registro con ese nombre." },
        { status: 422 }
      );
    }

    const item = await {{PascalRepository}}.createForUser(user.id, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`;

const API_ID_ROUTE = `import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { update{{Pascal}}Schema } from "@/modules/{{name}}/schemas";
import * as {{PascalRepository}} from "@/modules/{{name}}/repository";

// GET /api/{{name}}/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const item = await {{PascalRepository}}.findByIdForUser(id, user.id);
    if (!item) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/{{name}}/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON válido." },
      { status: 422 }
    );
  }

  const parsed = update{{Pascal}}Schema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  try {
    if (parsed.data.name !== undefined) {
      const nameExists = await {{PascalRepository}}.findByNameForUser(
        parsed.data.name,
        user.id,
        id
      );
      if (nameExists) {
        return NextResponse.json(
          { error: "Ya existe un registro con ese nombre." },
          { status: 422 }
        );
      }
    }

    const item = await {{PascalRepository}}.updateForUser(id, user.id, parsed.data);
    if (!item) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/{{name}}/[id] — soft delete only
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    await {{PascalRepository}}.softDeleteForUser(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`;

const PAGE = `"use client";

import { useState } from "react";
import { CrudPageHeader } from "@/components/crud-page-header";
import { use{{Pascals}} } from "@/modules/{{name}}/hooks/use{{Pascals}}";
import { use{{Pascal}}Form } from "@/modules/{{name}}/hooks/use{{Pascal}}Form";
import { use{{Pascal}}Delete } from "@/modules/{{name}}/hooks/use{{Pascal}}Delete";
import { {{Pascal}}Form } from "@/modules/{{name}}/components/{{Pascal}}Form";
import { {{Pascal}}Table } from "@/modules/{{name}}/components/{{Pascal}}Table";
import { {{Pascal}}DeleteConfirm } from "@/modules/{{name}}/components/{{Pascal}}DeleteConfirm";
import type { {{Pascal}} } from "@/modules/{{name}}/types";

export default function {{Pascals}}Page() {
  const [editing{{Pascal}}, setEditing{{Pascal}}] = useState<{{Pascal}} | null>(null);
  const [deleting{{Pascal}}, setDeleting{{Pascal}}] = useState<{{Pascal}} | null>(null);

  const { data, loading: listLoading, error: listError, refetch } = use{{Pascals}}({
    status: "all",
  });

  const form = use{{Pascal}}Form({
    initialValues: editing{{Pascal}} ?? undefined,
    onSuccess: () => {
      setEditing{{Pascal}}(null);
      refetch();
    },
  });

  const deleteOp = use{{Pascal}}Delete({
    onSuccess: () => {
      if (editing{{Pascal}}?.id === deleting{{Pascal}}?.id) setEditing{{Pascal}}(null);
      setDeleting{{Pascal}}(null);
      refetch();
    },
  });

  function handleEdit(item: {{Pascal}}) {
    setEditing{{Pascal}}(item);
  }

  function handleCancelForm() {
    setEditing{{Pascal}}(null);
    form.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudPageHeader title="{{label}}" />

      <{{Pascal}}Form
        values={form.values}
        loading={form.loading}
        error={form.error}
        validationError={form.validationError}
        isEditing={form.isEditing}
        setField={form.setField}
        onSubmit={form.submit}
        onCancel={handleCancelForm}
      />

      {listError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {listError}
        </div>
      )}

      <{{Pascal}}Table
        items={data}
        loading={listLoading}
        onEdit={handleEdit}
        onDelete={setDeleting{{Pascal}}}
      />

      <{{Pascal}}DeleteConfirm
        open={!!deleting{{Pascal}}}
        nombre={deleting{{Pascal}}?.name}
        loading={deleteOp.loading}
        error={deleteOp.error}
        onClose={() => setDeleting{{Pascal}}(null)}
        onConfirm={() => deleting{{Pascal}} && deleteOp.remove(deleting{{Pascal}}.id)}
      />
    </div>
  );
}
`;

function migrationSql(n, tableName, label) {
  return `-- =============================================================================
-- Migration: ${n}_${tableName}.sql
-- Description: ${label} table with RLS, soft delete, and auto-updated_at
-- =============================================================================

create table public.${tableName} (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text        null,
  status      text        not null default 'active'
                          check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz null
);

alter table public.${tableName} enable row level security;

create policy "${tableName}_select_own"
  on public.${tableName}
  for select
  using (auth.uid() = user_id);

create policy "${tableName}_insert_own"
  on public.${tableName}
  for insert
  with check (auth.uid() = user_id);

create policy "${tableName}_update_own"
  on public.${tableName}
  for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "${tableName}_delete_own"
  on public.${tableName}
  for delete
  using (auth.uid() = user_id);

create trigger ${tableName}_set_updated_at
  before update on public.${tableName}
  for each row
  execute function public.handle_updated_at();
`;
}

// ─── Generate files ───────────────────────────────────────────────────────────

console.log(`\n┌─ Generating module: ${name} (${label})`);
console.log(`│  singular: ${singular}  Pascal: ${Pascal}  Pascals: ${Pascals}\n`);

const src = path.join(ROOT, "src");
const mod = path.join(src, "modules", name);
const api = path.join(src, "app", "api", name);
const page = path.join(src, "app", "(protected)", name);

// Module
writeFile(path.join(mod, "types.ts"),        render(TYPES, v));
writeFile(path.join(mod, "schemas.ts"),       render(SCHEMAS, v));
writeFile(path.join(mod, "repository.ts"),    render(REPOSITORY, v));
writeFile(path.join(mod, "service.ts"),       render(SERVICE, v));
writeFile(path.join(mod, "index.ts"),         render(INDEX, v));
writeFile(path.join(mod, "hooks", `use${Pascals}.ts`),      render(HOOK_LIST, v));
writeFile(path.join(mod, "hooks", `use${Pascal}Form.ts`),   render(HOOK_FORM, v));
writeFile(path.join(mod, "hooks", `use${Pascal}Delete.ts`), render(HOOK_DELETE, v));
writeFile(path.join(mod, "components", `${Pascal}Form.tsx`),          render(COMPONENT_FORM, v));
writeFile(path.join(mod, "components", `${Pascal}Table.tsx`),         render(COMPONENT_TABLE, v));
writeFile(path.join(mod, "components", `${Pascal}DeleteConfirm.tsx`), render(COMPONENT_DELETE_CONFIRM, v));

// API routes
writeFile(path.join(api, "route.ts"),         render(API_ROUTE, v));
writeFile(path.join(api, "[id]", "route.ts"), render(API_ID_ROUTE, v));

// Page
writeFile(path.join(page, "page.tsx"),        render(PAGE, v));

// Migration
const migFile = `${migNum}_${name}.sql`;
writeFile(
  path.join(ROOT, "supabase", "migrations", migFile),
  migrationSql(migNum, name, label)
);

// ─── Update config/routes.ts ──────────────────────────────────────────────────

const routesPath = path.join(ROOT, "src", "config", "routes.ts");
let routesContent = fs.readFileSync(routesPath, "utf8");

const protectedStart = routesContent.indexOf("export const protectedRoutes = [");
const protectedClose = routesContent.indexOf("] as const;", protectedStart);

if (protectedStart === -1 || protectedClose === -1) {
  console.warn("\n  ⚠  Could not auto-update routes.ts — add manually:");
  console.warn(`     "/${name}" to protectedRoutes`);
} else {
  routesContent =
    routesContent.slice(0, protectedClose) +
    `  "/${name}",\n` +
    routesContent.slice(protectedClose);
  fs.writeFileSync(routesPath, routesContent, "utf8");
  console.log("  ✓  src/config/routes.ts (updated)");
}

// ─── Update config/app.ts ─────────────────────────────────────────────────────

const appPath = path.join(ROOT, "src", "config", "app.ts");
let appContent = fs.readFileSync(appPath, "utf8");

// 1. Add feature flag to AppFeatures type
const appFeaturesStart = appContent.indexOf("export type AppFeatures = {");
const appFeaturesClose = appContent.indexOf("};", appFeaturesStart);

if (appFeaturesStart === -1 || appFeaturesClose === -1) {
  console.warn("  ⚠  Could not auto-update AppFeatures — add manually:");
  console.warn(`     ${name}: boolean;`);
} else {
  appContent =
    appContent.slice(0, appFeaturesClose) +
    `  /** ${label} module. */\n  ${name}: boolean;\n` +
    appContent.slice(appFeaturesClose);
}

// 2. Add nav item before the Settings link
const settingsNavIdx = appContent.indexOf('    { label: "Settings"');
if (settingsNavIdx === -1) {
  console.warn("  ⚠  Could not find Settings nav item — add nav item manually:");
  console.warn(`     { label: "${label}", href: "/${name}", feature: "${name}" },`);
} else {
  appContent =
    appContent.slice(0, settingsNavIdx) +
    `    { label: "${label}", href: "/${name}", feature: "${name}" },\n` +
    appContent.slice(settingsNavIdx);
}

// 3. Add feature flag value to features object
const featuresObjStart = appContent.indexOf("  features: {");
const featuresObjClose = appContent.indexOf("  },", featuresObjStart);

if (featuresObjStart === -1 || featuresObjClose === -1) {
  console.warn("  ⚠  Could not auto-update features object — add manually:");
  console.warn(`     ${name}: true,`);
} else {
  appContent =
    appContent.slice(0, featuresObjClose) +
    `    ${name}: true,\n` +
    appContent.slice(featuresObjClose);
}

fs.writeFileSync(appPath, appContent, "utf8");
console.log("  ✓  src/config/app.ts (updated)");

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log(`
└─ Done!

   Module:    src/modules/${name}/
   API:       src/app/api/${name}/
   Page:      src/app/(protected)/${name}/page.tsx
   Migration: supabase/migrations/${migFile}
   Config:    routes.ts + app.ts updated

   Next steps:
     1. Apply migration: supabase db push
     2. Restart the dev server
     3. Visit /${name} in your app
`);
