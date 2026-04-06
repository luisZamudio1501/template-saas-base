📄 BASE FUNDACIONAL — FÁBRICA DE SaaS
________________________________________
1. 🎯 OBJETIVO DE LA FÁBRICA
Construir un sistema de producción de aplicaciones SaaS que permita:
•	desarrollar productos de forma rápida y ordenada 
•	reducir el tiempo de desarrollo reutilizando una base común 
•	validar ideas en el mercado lo antes posible 
•	escalar productos sin necesidad de rehacerlos completamente 
•	mantener una arquitectura que permita evolucionar hacia sistemas más complejos 
________________________________________
2. 🧱 ENFOQUE GENERAL
La fábrica se construye en dos niveles:
Nivel 1 — Producción rápida (MVP)
Objetivo:
•	sacar productos funcionales en el menor tiempo posible 
•	validar ideas y generar ingresos 
Características:
•	desarrollo ágil 
•	estructura liviana 
•	foco en funcionalidad, no perfección 
________________________________________
Nivel 2 — Escalamiento (backend avanzado)
Objetivo:
•	soportar productos con mayor complejidad 
•	manejar lógica de negocio más avanzada 
•	preparar productos para crecimiento 
Características:
•	backend dedicado (Spring Boot) 
•	mayor control sobre lógica y procesos 
•	arquitectura más robusta 
________________________________________
3. 🛠️ STACK TECNOLÓGICO
Nivel 1 (Base de producción rápida)
•	Frontend + App: Next.js 
•	Base de datos + Auth: Supabase 
•	Automatización: n8n 
•	Despliegue: Vercel 
•	Generación de código: Claude Code 
________________________________________
Nivel 2 (Escalamiento)
•	Backend: Spring Boot 
•	API REST 
•	Integración con frontend existente 
________________________________________
4. 🧠 PRINCIPIO ARQUITECTÓNICO CLAVE
Toda aplicación debe respetar esta estructura:
Pantallas → Servicios → Motor
________________________________________
Regla fundamental:
•	las pantallas nunca acceden directamente a la base de datos 
•	las pantallas siempre utilizan una capa de servicios 
•	el motor (Supabase o Spring) puede cambiar sin afectar las pantallas 
________________________________________
5. 🧩 TIPOS DE PRODUCTOS A FABRICAR
La fábrica se enfoca en productos de alta velocidad de salida:
•	sistemas de reservas 
•	mini CRM 
•	seguimiento de clientes 
•	formularios con panel 
•	dashboards operativos 
•	cotizadores 
•	automatizaciones con interfaz 
•	sistemas internos simples para negocios 
________________________________________
6. 📦 COMPONENTES BASE DEL TEMPLATE
Toda aplicación generada debe incluir:
Base estructural
•	sistema de login 
•	layout general 
•	menú de navegación 
•	dashboard inicial 
________________________________________
Funcionalidad común
•	gestión de usuarios 
•	manejo de datos (CRUD base) 
•	formularios reutilizables 
•	tablas reutilizables 
•	manejo de errores 
•	configuración de entorno 
________________________________________
Arquitectura interna
•	separación por módulos 
•	capa de servicios por cada módulo 
•	contratos de datos definidos 
•	desacople del motor de datos 
________________________________________
7. 🔌 PREPARACIÓN PARA ESCALAR A SPRING BOOT
Desde el inicio, el sistema debe permitir:
•	reemplazar el motor de datos sin modificar las pantallas 
•	mantener la misma estructura de servicios 
•	reutilizar los contratos de datos 
•	separar claramente lógica de UI y lógica de negocio 
________________________________________
8. ⚙️ CRITERIO DE USO DE SPRING BOOT
Un producto pasará a Nivel 2 cuando:
•	tenga lógica de negocio compleja 
•	requiera múltiples reglas o validaciones 
•	necesite procesamiento de datos avanzado 
•	tenga múltiples roles o permisos complejos 
•	deba escalar como producto principal 
________________________________________
9. 🧭 FLUJO DE PRODUCCIÓN DE PRODUCTOS
Cada producto se desarrolla siguiendo este flujo:
1.	definición del problema 
2.	definición del alcance mínimo 
3.	creación del proyecto desde template base 
4.	división en módulos 
5.	desarrollo asistido por IA 
6.	pruebas funcionales 
7.	ajuste 
8.	preparación de demo 
9.	salida al mercado 
________________________________________
10. 📊 SISTEMA DE CONTROL INTERNO
La fábrica debe contar con un sistema para gestionar:
Productos
•	nombre 
•	estado 
•	prioridad 
•	fecha de inicio 
•	nivel (1 o 2) 
________________________________________
Tareas
•	descripción 
•	estado (pendiente, en curso, terminado) 
•	módulo asociado 
•	bloqueo (si existe) 
•	próximo paso 
________________________________________
Estado del producto
•	en desarrollo 
•	en prueba 
•	listo para demo 
•	listo para venta 
________________________________________
11. 🎯 OBJETIVO OPERATIVO
El objetivo no es construir software perfecto.
El objetivo es:
•	reducir el tiempo entre idea y producto funcional 
•	aumentar la cantidad de productos generados 
•	validar rápido qué productos funcionan 
•	generar ingresos lo antes posible 
________________________________________
12. 🚫 PRINCIPIOS A RESPETAR
•	no comenzar proyectos desde cero 
•	no acoplar UI con base de datos 
•	no sobre-ingenierizar en etapa inicial 
•	no retrasar salida por perfeccionismo 
•	no usar Spring Boot sin necesidad real 
________________________________________
13. 🧠 FILOSOFÍA DE TRABAJO
La fábrica se basa en:
•	repetición de procesos 
•	reutilización de estructuras 
•	división en módulos 
•	desarrollo incremental 
•	validación temprana 
________________________________________
14. 📌 DEFINICIÓN FINAL
Esta fábrica no es un proyecto puntual.
Es un sistema que permite:
👉 producir aplicaciones de forma constante
👉 mejorar con cada iteración
👉 escalar sin rehacer todo
👉 convertir ideas en productos vendibles

