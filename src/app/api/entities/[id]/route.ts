import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { EntityStatus } from "@/modules/entities/types";
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

  const body: {
    name?: string;
    description?: string | null;
    status?: EntityStatus;
  } = await request.json().catch(() => ({}));

  const payload: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json(
        { error: "El nombre no puede estar vacío." },
        { status: 422 }
      );
    }

    // Uniqueness check scoped to user, excluding the record being updated
    const { data: existing } = await supabase
      .from("entities")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", name)
      .is("deleted_at", null)
      .neq("id", id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una entity con ese nombre." },
        { status: 422 }
      );
    }

    payload.name = name;
  }

  if (body.description !== undefined) {
    payload.description = body.description?.trim() || null;
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
