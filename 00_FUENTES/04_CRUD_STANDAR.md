# 📄 04_CRUD_STANDARD.md

## 🎯 OBJETIVO

Formalizar el estándar oficial de módulos CRUD reutilizables dentro del template base de la fábrica SaaS.

Este documento define:

- estructura mínima obligatoria
- contratos base
- componentes reutilizables
- reglas de uso
- límites del sistema CRUD base

---

## 🧱 ESTRUCTURA OFICIAL DEL MÓDULO

Todo módulo CRUD del template debe seguir esta estructura mínima:

    src/
    ├── app/
    │   └── <recurso>/
    │       └── page.tsx
    ├── modules/
    │   └── <recurso>/
    │       ├── types.ts
    │       ├── service.ts
    │       └── index.ts

### Regla

- `app/<recurso>/page.tsx` consume el módulo
- `modules/<recurso>/types.ts` define contratos
- `modules/<recurso>/service.ts` encapsula acceso a datos
- `modules/<recurso>/index.ts` centraliza exports

---

## 📦 CONTRATO OFICIAL DEL MÓDULO

### En `types.ts`

Todo módulo debe definir como mínimo:

- tipo principal del recurso
- tipo de creación
- tipo de actualización
- enums o unions si aplica

Ejemplo de patrón:

    export interface Recurso {
      id: string;
      created_at: string;
    }

    export interface CrearRecursoInput {}

    export interface ActualizarRecursoInput {}

---

### En `service.ts`

Todo módulo CRUD debe implementar como mínimo:

- getAll()
- getById(id)
- create(input)
- update(id, input)
- remove(id)

---

## 🧠 REGLA ARQUITECTÓNICA OBLIGATORIA

Todo módulo CRUD debe respetar siempre:

Pantallas → Servicios → Motor

Esto implica:

- la página nunca accede directamente a Supabase
- toda operación pasa por `service.ts`
- el motor de datos puede cambiar sin romper la UI

---

## 🧩 COMPONENTES BASE DEL SISTEMA CRUD

A partir de este punto, el sistema CRUD base del template queda compuesto por estas piezas mínimas:

- CrudList
- CrudActions
- CrudPageHeader
- CrudForm

---

## ✅ MÓDULO PATRÓN DE REFERENCIA

El módulo `entities` queda definido como:

módulo patrón de referencia del sistema CRUD base

---

## 📏 REGLAS DE USO

- no crear módulos nuevos copiando código desordenado
- reutilizar CrudPageHeader, CrudForm, CrudList y CrudActions
- no mezclar lógica de dominio con componentes genéricos
- respetar Pantallas → Servicios → Motor

---

## 🚫 LÍMITES DEL ESTÁNDAR ACTUAL

No incluye:

- filtros avanzados
- paginación
- búsqueda
- modales
- validaciones complejas
- notificaciones

---

## 🎯 RESULTADO

El sistema CRUD base del template queda formalizado.

Siguiente bloque:

auth básica / user / perfil
