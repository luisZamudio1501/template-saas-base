import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createEntitySchema } from "@/modules/entities/schemas";
import { ENTITY_SELECT, EntityRow, mapEntityRow } from "./_lib";

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
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");

  let query = supabase
    .from("entities")
    .select(ENTITY_SELECT)
    .eq("user_id", user.id) // explicit scope — defense in depth on top of RLS
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // status is already scoped to "active" | "inactive" by the client service.
  // "all" is never forwarded, so any value here is a concrete filter.
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data as EntityRow[]).map(mapEntityRow));
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

  const { name, description, status } = parsed.data;

  // Uniqueness check explicitly scoped to this user — not relying solely on RLS
  const { data: existing } = await supabase
    .from("entities")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", name)
    .is("deleted_at", null)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Ya existe una entity con ese nombre." },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("entities")
    .insert({
      user_id: user.id,
      name,
      description: description ?? null,
      status: status ?? "active",
    })
    .select(ENTITY_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapEntityRow(data as EntityRow), { status: 201 });
}
