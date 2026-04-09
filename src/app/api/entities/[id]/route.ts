import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { updateEntitySchema } from "@/modules/entities/schemas";
import * as EntityRepository from "@/modules/entities/repository";

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

  try {
    const entity = await EntityRepository.findByIdForUser(id, user.id);
    if (!entity) {
      return NextResponse.json({ error: "Entity no encontrada." }, { status: 404 });
    }
    return NextResponse.json(entity);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

  try {
    if (parsed.data.name !== undefined) {
      const nameExists = await EntityRepository.findByNameForUser(
        parsed.data.name,
        user.id,
        id
      );
      if (nameExists) {
        return NextResponse.json(
          { error: "Ya existe una entity con ese nombre." },
          { status: 422 }
        );
      }
    }

    const entity = await EntityRepository.updateForUser(id, user.id, parsed.data);
    if (!entity) {
      return NextResponse.json({ error: "Entity no encontrada." }, { status: 404 });
    }
    return NextResponse.json(entity);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

  try {
    await EntityRepository.softDeleteForUser(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
