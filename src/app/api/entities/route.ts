import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createEntitySchema } from "@/modules/entities/schemas";
import * as EntityRepository from "@/modules/entities/repository";

// GET /api/entities
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
    const entities = await EntityRepository.findAllByUser(user.id, { search, status: status as "active" | "inactive" | undefined });
    return NextResponse.json(entities);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/entities
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

  const parsed = createEntitySchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  try {
    const nameExists = await EntityRepository.findByNameForUser(parsed.data.name, user.id);
    if (nameExists) {
      return NextResponse.json(
        { error: "Ya existe una entity con ese nombre." },
        { status: 422 }
      );
    }

    const entity = await EntityRepository.createForUser(user.id, parsed.data);
    return NextResponse.json(entity, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
