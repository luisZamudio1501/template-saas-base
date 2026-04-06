📄 MÓDULO OPCIONAL — LÍNEA DESKTOP (ELECTRON)
1. Definición general

La fábrica incorpora una línea de productos Desktop (instalables) como complemento de la línea principal SaaS.

Este módulo permite construir aplicaciones que:

se instalan en una computadora
funcionan sin conexión a internet
almacenan datos localmente
no requieren servidor externo

Este módulo es opcional y no modifica ni interfiere con el template base SaaS.

2. Objetivo del módulo

El objetivo es ampliar la capacidad de la fábrica para cubrir casos donde el modelo SaaS no es suficiente o no es deseado.

Permite ofrecer soluciones para:

entornos offline
clientes que no quieren suscripciones
sistemas internos de uso local
implementaciones rápidas sin infraestructura
3. Posicionamiento dentro de la fábrica

La fábrica queda estructurada en dos líneas principales:

Línea 1 — SaaS (principal)
Aplicaciones web
Multiusuario
Basadas en la nube
Modelo de suscripción
Línea 2 — Desktop (Electron) (opcional)
Aplicaciones instalables
Uso local
Base de datos embebida
Modelo de pago único o híbrido
4. Tecnologías utilizadas

La línea Desktop se construye sobre:

Electron → contenedor de aplicación de escritorio
Frontend reutilizable (React / Next.js exportado)
Backend embebido (Express opcional)
Base de datos local (SQLite)
Librerías de acceso a datos (ej: better-sqlite3)
5. Arquitectura del sistema Desktop

Estructura general:

Electron (main)
│
├── Ventana (renderer)
│   └── Frontend (UI)
│
├── Preload (bridge seguro)
│
├── API local (Express opcional)
│
└── Base de datos (SQLite local)

Características:

ejecución local completa
comunicación interna vía localhost
separación entre UI y lógica
persistencia en archivo local
6. Modelo de datos

El sistema utiliza una base de datos local:

motor: SQLite
almacenamiento: archivo .db
ubicación típica:
%APPDATA%/<app>/data/ (Windows)

Se incluye:

base inicial (seed)
sistema de backup
sistema de importación
7. Integración con la arquitectura de la fábrica

Este módulo respeta el principio central:

Pantallas → Servicios → Motor

Por lo tanto:

el frontend puede ser reutilizado
la lógica puede adaptarse
el backend puede ser:
local (Express)
o remoto (API SaaS)
8. Modos de funcionamiento posibles
Modo 1 — Offline puro
SQLite local
sin conexión
uso individual
Modo 2 — Conectado
consume API SaaS
sincronización de datos
multiusuario
Modo 3 — Híbrido
trabaja localmente
sincroniza cuando hay conexión
backup en la nube
9. Casos de uso ideales

Este módulo es especialmente útil para:

pequeñas y medianas empresas
depósitos y logística
talleres y fábricas
sistemas administrativos internos
entornos con conectividad limitada
10. Modelo de negocio

Permite múltiples estrategias:

venta por licencia (pago único)
versión gratuita + upgrades
modelo híbrido (desktop + suscripción)
servicio de instalación y soporte
11. Ventajas
no requiere servidor
instalación simple
funcionamiento offline
alto rendimiento local
independencia de internet
12. Limitaciones
no es multiusuario por defecto
sincronización requiere desarrollo adicional
escalabilidad limitada en modo local
dependencia del sistema operativo
13. Relación con el template base

Este módulo:

NO reemplaza el template base
NO modifica la arquitectura SaaS
funciona como extensión opcional

El template base sigue siendo:

Next.js + Supabase + n8n

Electron se incorpora solo cuando el caso lo requiere.

14. Estado dentro de la fábrica
definido a nivel conceptual
pendiente de template técnico
implementación futura como módulo reutilizable
15. Conclusión

La incorporación de la línea Desktop permite que la fábrica no solo construya SaaS, sino también:

software instalable, adaptable a distintos contextos y modelos de negocio

Esto amplía significativamente el alcance comercial y técnico del sistema.