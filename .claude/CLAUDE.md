# Contexto del proyecto

Este proyecto es un template base para la creación de aplicaciones SaaS dentro de una fábrica de productos digitales.

No es una aplicación de negocio específica.
Es una base reutilizable que debe mantenerse limpia y desacoplada.

## Objetivo

Permitir construir nuevos SaaS de forma rápida, consistente y escalable, reutilizando arquitectura, componentes y patrones.

## Arquitectura

El proyecto sigue una separación estricta de capas:

- app/ → pantallas (Next.js)
- modules/ → lógica de negocio (services + types)
- components/ → UI reutilizable
- lib/ → infraestructura (Supabase, utils)

## Regla principal

Pantallas → Servicios → Motor

Las páginas (app) nunca deben acceder directamente a Supabase.

Toda interacción con datos debe pasar por:
modules/<recurso>/service.ts

## Módulos

Cada módulo debe seguir esta estructura:

modules/<recurso>/
  service.ts
  types.ts
  index.ts
  components/
  hooks/

El módulo `entities` funciona como patrón base para nuevos módulos CRUD.

## Autenticación

La autenticación se maneja con Supabase.

- La validación de sesión se realiza en middleware (server-side)
- Las rutas protegidas no deben renderizar sin sesión
- El layout protegido funciona como fallback UX en cliente

No mover la lógica de autenticación al cliente.

## Componentes

Los componentes en `components/` deben ser reutilizables.

Ejemplos:
- crud-list
- crud-page-header
- form-field

No deben contener lógica específica de un módulo.

## Estilo y UI

- Tailwind CSS como base
- Sistema de diseño basado en tokens
- Componentes de UI desacoplados

## Idioma

- Código: inglés
- Interfaz de usuario: español

Mantener consistencia.

## Uso del template

Este proyecto se clona para crear nuevos SaaS.

Flujo:

1. Copiar el template
2. Renombrar el proyecto
3. Inicializar nuevo repositorio
4. Adaptar a un caso de negocio

## Restricción clave

Este template NO debe:

- contener lógica de negocio específica
- acoplarse a un cliente o dominio
- modificarse para resolver casos particulares

Si un cambio no es reutilizable, no pertenece al template.

## Rol de Claude

Claude se utiliza como ejecutor técnico dentro del proyecto.

Debe:

- respetar la arquitectura
- no romper la separación de capas
- no introducir acoples innecesarios
- seguir el patrón definido en modules/

Antes de implementar cambios, debe entender el contexto del template.

## Objetivo final

Mantener una base estable, reusable y escalable que permita crear productos reales sin rehacer arquitectura en cada proyecto.