# template-saas-base

## Descripción
Template base para la creación de aplicaciones SaaS.

Este proyecto define la arquitectura, estructura y componentes necesarios para construir productos digitales reutilizables, escalables y listos para producción.

## Objetivo

Proveer una base técnica sólida que permita:

- Crear aplicaciones SaaS rápidamente
- Reutilizar estructura y patrones de desarrollo
- Mantener una arquitectura desacoplada (Pantallas → Servicios → Motor)
- Reducir tiempo de desarrollo en nuevos proyectos

## Arquitectura

El proyecto sigue una separación clara de capas:

- **Pantallas (app)** → UI y navegación
- **Servicios (modules)** → lógica de negocio
- **Infraestructura (lib)** → conexión con Supabase y utilidades

Regla principal:
Las pantallas nunca acceden directamente a Supabase.  
Toda la lógica pasa por los servicios.

## Autenticación

El sistema utiliza Supabase con validación de sesión en servidor mediante middleware.

- Las rutas protegidas se validan antes de renderizar
- No se permite acceso sin sesión activa
- El layout protegido actúa como fallback en cliente

Importante:
No modificar el middleware sin entender el flujo completo de autenticación.

## Variables de entorno

Archivo de ejemplo:

.env.example

Contenido:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here  

Las credenciales reales deben colocarse en:

.env.local

Este archivo no se sube al repositorio.

## Estructura del proyecto

src/
  app/        → pantallas (Next.js)
  modules/    → lógica de negocio (services + types)
  components/ → UI reutilizable
  lib/        → configuración e integraciones
  hooks/      → hooks compartidos
  styles/     → estilos globales y tokens

## Tecnologías

- Next.js 15
- React 19
- Tailwind CSS
- shadcn/ui
- Supabase (auth + base de datos)

## Estado actual

- Template base completo y funcional
- Módulo CRUD de ejemplo (entities)
- Autenticación protegida en servidor (middleware)
- Estructura lista para clonación

## Uso

Este proyecto está diseñado para ser clonado y reutilizado.

Flujo recomendado:

1. Copiar este template
2. Renombrar el proyecto
3. Inicializar un nuevo repositorio
4. Adaptar a un caso de negocio
5. Construir el producto

## Regla clave

Este template no debe contener lógica de negocio específica.  
Solo estructura reutilizable.

## Autor

Luis Zamudio