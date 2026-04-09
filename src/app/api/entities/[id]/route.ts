import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { updateEntitySchema } from "@/modules/entities/schemas";
import { ENTITY_SELECT, EntityRow, mapEntityRow } from "../_lib";

// GET /api/entities/[id]
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

  const { data, error } = await supabase
    .from("entities")
    .select(ENTITY_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Entity no encontrada." }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapEntityRow(data as EntityRow));
}

// PATCH /api/entities/[id]
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

  const parsed = updateEntitySchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const body = parsed.data;
  const payload: Record<string, unknown> = {};

  if (body.name !== undefined) {
    // body.name is already trimmed and validated (min 1) by the schema.
    // Uniqueness check scoped to user, excluding the record being updated.
    const { data: existing } = await supabase
      .from("entities")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", body.name)
      .is("deleted_at", null)
      .neq("id", id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una entity con ese nombre." },
        { status: 422 }
      );
    }

    payload.name = body.name;
  }

  if (body.description !== undefined) {
    // body.description is already trimmed; convert empty string to null.
    payload.description = body.description || null;
  }

  if (body.status !== undefined) {
    payload.status = body.status;
  }

  const { data, error } = await supabase
    .from("entities")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select(ENTITY_SELECT)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Entity no encontrada." }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapEntityRow(data as EntityRow));
}

// DELETE /api/entities/[id] — soft delete only, never hard delete
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

  const { error } = await supabase
    .from("entities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
