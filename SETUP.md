# Guía de configuración y clonación

Este documento explica cómo configurar el template desde cero y cómo crear el primer módulo de negocio.

---

## Requisitos previos

- Node.js 18 o superior
- Una cuenta en [Supabase](https://supabase.com) (gratuita)
- Git

---

## Paso 1 — Clonar el proyecto

```bash
git clone <url-del-repositorio> mi-nuevo-saas
cd mi-nuevo-saas
npm install
```

Inicializar un repositorio nuevo para el producto:

```bash
rm -rf .git
git init
git add .
git commit -m "init: basado en template-saas-base"
```

---

## Paso 2 — Configurar el nombre y navegación de la app

Editar el archivo central de configuración:

```
src/config/app.ts
```

Cambiar como mínimo:

```typescript
export const appConfig: AppConfig = {
  appName: "Mi SaaS",           // nombre visible en header, tab y landing
  appDescription: "...",        // descripción en landing y meta tags

  navigation: [
    { label: "Dashboard", href: "/dashboard" },
    // Agregar o eliminar módulos según el producto
    { label: "Settings", href: "/settings" },
  ],

  features: {
    entities: false,            // poner en false para ocultar el módulo de ejemplo
  },
};
```

---

## Paso 3 — Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New project
2. Elegir nombre, región y contraseña de base de datos
3. Esperar a que el proyecto termine de inicializarse (~2 min)

---

## Paso 4 — Configurar variables de entorno

En el dashboard de Supabase: **Settings → API**

Copiar:
- `Project URL`
- `anon / public` key

Crear el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Este archivo NO se sube al repositorio (ya está en `.gitignore`).

---

## Paso 5 — Ejecutar la migración SQL

En el dashboard de Supabase: **SQL Editor → New query**

Copiar y ejecutar el contenido de:

```
supabase/migrations/0001_init.sql
```

Este script crea la tabla `entities` con Row Level Security activado.
Sin este paso, el módulo de ejemplo mostrará errores al intentar cargar datos.

> Si el producto no usará el módulo `entities`, igualmente ejecutar la migración
> (no tiene costo). Luego eliminar las tablas si se prefiere.

---

## Paso 6 — Levantar el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

Flujo esperado:
- Landing pública en `/`
- Registro en `/register`
- Login en `/login`
- Dashboard protegido en `/dashboard`

---

## Paso 7 — Crear un nuevo módulo de negocio

El módulo `entities` es el patrón base. Para crear un módulo nuevo (por ejemplo `customers`):

### 7.1 — Copiar la estructura

```bash
cp -r src/modules/entities src/modules/customers
```

### 7.2 — Renombrar los tipos

En `src/modules/customers/types.ts`, renombrar:
- `Entity` → `Customer`
- `CreateEntityInput` → `CreateCustomerInput`
- `UpdateEntityInput` → `UpdateCustomerInput`
- `EntityFilters` → `CustomerFilters`
- Ajustar los campos al dominio real

### 7.3 — Actualizar el service

En `src/modules/customers/service.ts`:
- Cambiar el endpoint de `/api/entities` a `/api/customers`
- Actualizar el nombre del servicio exportado

### 7.4 — Crear los Route Handlers

```bash
cp -r src/app/api/entities src/app/api/customers
```

En los nuevos archivos, renombrar:
- Las referencias a `entities` por `customers` en los nombres de tabla y tipos
- El `ENTITY_SELECT` y `EntityRow` en `_lib.ts`

### 7.5 — Crear la tabla en Supabase

En el SQL Editor de Supabase, crear la tabla del nuevo dominio con RLS activado.
Usar `supabase/migrations/0001_init.sql` como referencia para la estructura y las políticas.

### 7.6 — Crear la página

```bash
cp -r src/app/(protected)/entities src/app/(protected)/customers
```

Actualizar los imports y referencias al módulo en los archivos copiados.

### 7.7 — Actualizar la configuración

En `src/config/app.ts`, agregar el item de navegación:

```typescript
navigation: [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Customers", href: "/customers" },
  { label: "Settings", href: "/settings" },
],
```

En `src/config/routes.ts`, agregar la ruta protegida:

```typescript
export const protectedRoutes = [
  "/dashboard",
  "/customers",   // ← agregar
  "/settings",
  "/me",
];
```

En `middleware.ts`, agregar al matcher:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",   // ← agregar
    "/settings/:path*",
    ...
  ],
};
```

---

## Archivos clave para entender el template

| Archivo | Propósito |
|---|---|
| `src/config/app.ts` | Nombre, navegación y feature flags |
| `src/config/routes.ts` | Rutas protegidas y de autenticación |
| `src/middleware.ts` | Protección de rutas server-side |
| `src/modules/entities/` | Módulo CRUD de ejemplo — patrón base |
| `src/app/api/entities/` | Route Handlers del módulo de ejemplo |
| `supabase/migrations/` | Esquema SQL de referencia |

---

## Convenciones del proyecto

- **Código**: inglés
- **UI**: español
- **Rutas protegidas**: siempre declaradas en `src/config/routes.ts` Y en el matcher de `middleware.ts`
- **Acceso a base de datos**: solo desde Route Handlers (`src/app/api/`), nunca desde el browser
- **Nuevos módulos**: seguir la estructura de `src/modules/entities/`
