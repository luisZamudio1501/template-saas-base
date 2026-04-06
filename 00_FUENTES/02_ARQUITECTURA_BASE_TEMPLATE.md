# Día 4 — Normalización del Template Base

## Objetivo

Eliminar complejidad innecesaria y definir una arquitectura clara, mínima y escalable.

---

## Decisiones clave

### 1. Eliminación de capas innecesarias

Se eliminaron completamente:

- src/core → estructura teórica sin implementación
- src/services → sin uso real
- carpetas vacías en components, lib y modules

---

### 2. Definición de capas oficiales

La arquitectura queda definida de la siguiente forma:

- app/ → rutas y entrypoints (Next.js)
- modules/ → lógica de negocio
- components/ → UI reutilizable
- lib/ → utilidades
- hooks/ → lógica de React
- store/ → estado global
- styles/ → diseño

---

### 3. Estandarización de módulos

Cada módulo debe seguir este patrón:

modules/<nombre>/
- index.ts
- service.ts
- types.ts

Ejemplo implementado:
modules/projects/

---

### 4. Regla fundamental

No se crean estructuras sin necesidad real.

Toda carpeta debe:
- tener código
- tener propósito claro

---

## Resultado

Se obtuvo un template:

- simple
- limpio
- entendible
- listo para escalar

---

## Próximo paso

Día 5 — Definición de servicios reales e integración con Supabase / backend