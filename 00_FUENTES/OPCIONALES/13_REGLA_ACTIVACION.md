📄 REGLA OPERATIVA — ACTIVACIÓN OPCIONAL DE ELECTRON EN LA FÁBRICA SaaS
1. 🎯 OBJETIVO

Definir con claridad cuándo corresponde activar Electron dentro del flujo de la fábrica y cuándo no.

Esta regla existe para:

evitar usar desktop cuando no hace falta
no agregar peso técnico innecesario
proteger la velocidad de salida del MVP
mantener limpio el template base
decidir de forma ordenada si un producto sale como web, desktop o ambos

Esta regla no modifica el template base ni la definición del Día 1. Solo agrega un criterio de decisión para ciertos productos.

2. 🧭 PRINCIPIO GENERAL

Electron no se activa por gusto ni por novedad.

Electron solo se activa cuando el producto realmente necesita canal desktop.

Regla madre:

Si el producto funciona bien como web y no gana una ventaja concreta por ser instalable, entonces no se activa Electron.

3. 🧱 LUGAR DE ESTA DECISIÓN EN EL FLUJO

La decisión aparece dentro del flujo normal de la fábrica:

definición del problema
definición del alcance mínimo
análisis del canal de entrega
decisión: web / desktop / web + desktop
continuación del flujo normal del producto

Esto encaja con el esquema de producción ya definido para la fábrica.

4. 👤 QUIÉN DECIDE LA ACTIVACIÓN
Product Strategist

Detecta si el producto necesita salir como app instalada por una razón comercial o de uso.

Debe preguntarse:

¿el cliente espera “un programa” y no una web?
¿el uso ocurre en entornos con mala conexión?
¿hay necesidad de trabajar sin navegador?
SaaS Architect

Evalúa si esa necesidad se resuelve con Electron sin complicar el sistema.

Debe definir:

si el canal desktop aporta una ventaja real
si conviene web + desktop o solo desktop
si el núcleo puede seguir compartido
Builder

Solo lo construye si la decisión ya fue tomada.

QA / Tester

Valida que la versión desktop funciona como canal de entrega y no solo como web metida en una ventana.

Esto respeta tu sistema de agentes y el orden de trabajo que ya definiste.

5. ✅ CHECKLIST DE ACTIVACIÓN

Electron se activa solo si se cumple al menos una de estas condiciones fuertes:

A. Necesidad de instalación local
el cliente quiere una app instalada en la PC
el valor comercial aumenta por entregar un instalador
el usuario final no quiere depender de abrir una URL
B. Trabajo offline o semioffline
el producto debe seguir funcionando sin internet
la conectividad del entorno es inestable
hace falta guardar datos localmente y sincronizar después
C. Uso del sistema operativo
acceso a archivos locales
exportación o importación frecuente de archivos
impresión local
interacción con carpetas, disco, periféricos o procesos del sistema
D. Contexto empresarial específico
el producto se vende como software interno
se instala en equipos de oficina o producción
el cliente percibe más valor en una app de escritorio que en una web
E. Requisito de operación cerrada
el producto debe correr dentro de una red interna
se busca reducir dependencia de servicios externos
hay restricción de acceso vía navegador o nube
6. ❌ CHECKLIST DE NO ACTIVACIÓN

Electron no debe activarse cuando ocurre alguna de estas situaciones:

A. El producto es un SaaS web común
panel administrativo
CRUD simple
dashboard online
formularios con login y base remota
B. La web ya resuelve bien el problema
no hay necesidad offline
no hay uso de archivos o hardware
el cliente puede trabajar perfectamente desde navegador
C. El foco es salir rápido
el MVP todavía no fue validado
todavía no hay usuarios reales
sumar desktop solo alarga la salida
D. No hay ventaja comercial concreta
Electron se quiere agregar “por si acaso”
no existe un motivo real de negocio
no mejora ni venta, ni uso, ni operación
7. 🟡 REGLA DE PRUDENCIA

Si hay duda entre web o desktop, la decisión por defecto es:

salir primero en web

Solo después, si el caso lo pide, se agrega el canal desktop.

Esto protege el objetivo operativo de la fábrica: sacar productos funcionales rápido, validar y no complicar antes de tiempo.

8. 🔁 POSIBLES RESULTADOS DE LA EVALUACIÓN
Resultado 1 — Web

Se mantiene el producto en Next.js y no se agrega canal desktop.

Resultado 2 — Web + Desktop

Se conserva la salida web y se agrega Electron como canal extra.

Resultado 3 — Desktop prioritario

Solo para casos muy concretos donde la operación instalada sea el centro del producto.

Regla recomendada para la fábrica:

el resultado más frecuente debería ser Web o Web + Desktop
Desktop prioritario debe ser excepción, no norma

9. 📌 PREGUNTAS DE DECISIÓN RÁPIDA

Antes de activar Electron, responder estas preguntas:

¿El cliente necesita instalar la app?
¿La app debe funcionar sin internet?
¿La app necesita archivos locales, impresoras o funciones del sistema?
¿La versión web no alcanza para resolver el problema?
¿Agregar desktop mejora de verdad la venta o el uso?
¿El MVP ya fue validado o al menos está claro?
Regla práctica
si la mayoría de las respuestas es no, no activar Electron
si hay dos o más sí fuertes, evaluar activación
si hay tres o más sí claros, Electron pasa a ser candidato real
10. 🧩 UBICACIÓN EN LOS DOCUMENTOS DEL PROYECTO

Esta regla puede guardarse como documento complementario, por ejemplo:

/PROYECTO/
05_ELECTRON_ACTIVATION_RULE.md

Y puede enlazarse con:

base fundacional
arquitectura del template
extensión opcional desktop
sistema de agentes
11. 🧠 EFECTO SOBRE EL TEMPLATE BASE

Esta regla confirma lo siguiente:

el template base no cambia
Electron no entra en el núcleo
solo se agrega cuando el producto lo necesita
la arquitectura general se conserva
la fábrica gana un canal nuevo sin romper su base
12. 📌 DEFINICIÓN FINAL

Electron dentro de la fábrica debe entenderse así:

no como parte obligatoria del template
no como decisión automática
no como mejora por sí misma

Sino como:

una salida opcional que se activa solo cuando aporta una ventaja real de uso, operación o venta

13. ✅ DECISIÓN OPERATIVA FINAL

Regla corta para recordar:

Web por defecto.
Electron solo con motivo claro.
Nunca por impulso.