📄 NORMA DE ARQUITECTURA
Integración del Módulo Desktop (Electron) en la Fábrica
1. Principio general

La fábrica mantiene un único template base como punto de partida para todos los productos.

El soporte para aplicaciones de escritorio se implementa mediante un módulo opcional, sin generar templates paralelos ni duplicación de arquitectura.

2. Regla principal (obligatoria)

Todo producto se inicia como aplicación web dentro del template base.

Solo se incorpora el módulo Desktop cuando existe una necesidad concreta.

3. Objetivo de esta norma

Evitar:

duplicación de código
múltiples templates
divergencia arquitectónica
complejidad innecesaria

Y garantizar:

coherencia en todos los productos
reutilización máxima
mantenimiento centralizado
4. Ubicación dentro del proyecto

Estructura conceptual:

template-base/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── ui/
│   ├── core/
│   └── servicios/
│
├── integraciones/
│   ├── supabase/
│   └── n8n/
│
└── modulos-opcionales/
    └── electron/

El módulo Electron vive dentro de:

👉 modulos-opcionales/electron/

5. Naturaleza del módulo Electron

El módulo Desktop:

no es un template independiente
no redefine la arquitectura
no modifica el núcleo

Es únicamente:

un canal adicional de ejecución del mismo sistema

6. Forma de integración

El módulo Electron se integra respetando esta estructura:

UI → Servicios → Motor

Donde:

UI: puede ser reutilizada (web)
Servicios: lógica compartida
Motor: backend (local o remoto)
7. Modos de funcionamiento

El módulo permite tres configuraciones:

7.1 Modo Web (default)
ejecución en navegador
backend remoto
Supabase / APIs
7.2 Modo Desktop Local
Electron
backend local (Express opcional)
SQLite
7.3 Modo Híbrido
Electron como cliente
backend remoto (SaaS)
sincronización opcional
8. Cuándo usar Electron

Se habilita el módulo solo si se cumple al menos una condición:

el cliente requiere funcionamiento offline
el entorno no garantiza conectividad
se necesita instalación local
el modelo comercial no es por suscripción
el sistema es de uso interno
9. Cuándo NO usar Electron

No se debe usar si:

el sistema es multiusuario en tiempo real
depende fuertemente de la nube
requiere alta escalabilidad
es un producto 100% SaaS
10. Separación de responsabilidades
Núcleo (template base)
reglas de negocio
modelo de datos
servicios
UI reutilizable
Módulo Electron
empaquetado
ejecución local
acceso a sistema operativo
persistencia local
11. Persistencia de datos

El módulo Desktop puede trabajar con:

Opción A — Local
SQLite
archivo .db
almacenamiento en sistema del usuario
Opción B — Remoto
APIs SaaS
Supabase
backend Spring Boot (futuro)
12. Estrategia de desarrollo

Orden obligatorio:

construir lógica en el template base
validar funcionamiento web
evaluar necesidad de desktop
integrar módulo Electron

Nunca al revés.

13. Estrategia de producto

Un mismo sistema puede distribuirse como:

aplicación web (SaaS)
aplicación de escritorio
solución híbrida

Sin duplicar desarrollo.

14. Beneficio estructural

Esta norma permite:

un único código base
múltiples formas de entrega
adaptación a distintos mercados
escalabilidad progresiva
15. Conclusión

La fábrica no crea múltiples sistemas independientes.

Crea:

un único sistema adaptable a distintos canales de ejecución

Electron es:

una extensión opcional, no una base alternativa

16. Estado
norma definida
lista para implementación futura
no bloquea el avance del template base