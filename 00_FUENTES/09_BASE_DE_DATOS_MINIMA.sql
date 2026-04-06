-- Tabla base del template

create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  entity_type text default 'general',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Índice para búsquedas por nombre
create index if not exists idx_entities_name on entities (name);

-- Índice para soft delete
create index if not exists idx_entities_deleted_at on entities (deleted_at);