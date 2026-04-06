# 📄 08_POLITICA_DE_ELIMINACION_Y_OPERACIONES_SENSIBLES.md

## 🎯 OBJETIVO

Definir la política oficial de eliminación de datos y manejo de operaciones sensibles dentro de la fábrica SaaS.

Este documento existe para:

- reducir riesgo de pérdida accidental de datos
- evitar que acciones destructivas queden expuestas de forma trivial en la UI
- mantener velocidad de salida sin comprometer seguridad operativa
- estandarizar el comportamiento del CRUD base en futuros productos

---

## 🧱 PRINCIPIO GENERAL

En la fábrica SaaS, la eliminación expuesta al usuario no debe ser física por defecto.

La política estándar es:

👉 el usuario opera con eliminación lógica  
👉 la eliminación física queda fuera del flujo normal del producto

---

## ✅ REGLA OFICIAL

### 1. Eliminación estándar del CRUD base

Toda acción de "eliminar" visible para usuarios debe implementarse como:

- soft delete
- borrado lógico
- archivado
- desactivación
- marcado de estado no activo

Según el modelo de datos del producto.

Esto puede resolverse con campos como:

- `deleted_at`
- `activo`
- `estado`
- `archivado`
- u otro mecanismo equivalente

---

### 2. Eliminación física (hard delete)

La eliminación física real:

- no forma parte del flujo estándar del usuario
- no debe quedar expuesta como botón normal del CRUD base
- no debe depender de una acción fácil de disparar desde cliente

La eliminación física solo debe ejecutarse por canales controlados.

Ejemplos válidos:

- scripts de mantenimiento
- herramientas internas de administración
- procesos manuales controlados
- backend seguro
- funciones restringidas por rol alto
- tareas técnicas fuera del flujo común

---

## 🧠 JUSTIFICACIÓN

Esta política existe porque:

### A. Protege datos
Evita pérdidas accidentales por errores de usuario o de interfaz.

### B. Favorece recuperación
Permite restaurar registros eliminados por error.

### C. Mejora auditoría
Hace posible rastrear cambios, estados y eventos.

### D. Facilita evolución del producto
Permite agregar más adelante:

- papelera
- restauración
- vistas filtradas
- historial
- archivado
- limpieza programada

Sin rehacer la base.

---

## ⚙️ REGLA OPERATIVA DEL TEMPLATE

A partir de esta política, el comportamiento recomendado del CRUD base es:

- `getAll()` → devuelve solo registros activos/no eliminados
- `getById()` → respeta la política del producto
- `create()` → crea registro activo
- `update()` → modifica registro existente
- `remove()` → ejecuta eliminación lógica

La eliminación física no debe ser el comportamiento por defecto de `remove()` en productos orientados a usuario final.

---

## 🚫 QUÉ NO HACER

No debe hacerse como política base:

- hard delete directo desde botón visible al usuario
- exponer operaciones destructivas irreversibles en CRUD estándar
- dejar borrado real accesible sin capa de control
- asumir que “entorno simple” justifica pérdida fácil de datos
- mezclar eliminación estándar con purga física sin distinguirlas

---

## 🟡 EXCEPCIONES

Puede aceptarse hard delete directo solo si se cumplen todas estas condiciones:

- el producto es interno o de prueba
- el dato no tiene valor histórico
- la pérdida no genera riesgo operativo
- el flujo está claramente controlado
- se acepta conscientemente esa limitación

Aun en esos casos, sigue siendo preferible separar:

- eliminación de usuario
- purga física técnica

---

## 🔐 OPERACIONES SENSIBLES

Esta política también aplica como criterio para otras operaciones sensibles, por ejemplo:

- cambios masivos
- reseteos
- cierres irreversibles
- cancelaciones definitivas
- cambios de estado críticos
- borrado de archivos
- eliminación de usuarios

Regla general:

👉 si la acción es destructiva o difícil de revertir, no debe quedar expuesta de forma trivial desde la UI cliente.

---

## 🧭 RELACIÓN CON LA ARQUITECTURA DE LA FÁBRICA

Esta política respeta el principio:

Pantallas → Servicios → Motor

Porque implica que:

- la UI no define por sí sola la criticidad de una operación
- la capa de servicios debe distinguir entre operación estándar y operación destructiva
- el motor puede cambiar sin romper esta política

---

## ✅ DECISIÓN FINAL

La fábrica SaaS adopta esta regla:

### Regla corta

- eliminar para usuario = eliminación lógica
- eliminación física = canal controlado
- hard delete no forma parte del CRUD base estándar

---

## 📌 EFECTO SOBRE FUTUROS PROYECTOS

A partir de este documento:

- los nuevos productos deben asumir soft delete como comportamiento base
- toda excepción debe decidirse conscientemente
- las operaciones sensibles deben diseñarse con control adicional
- el template gana seguridad operativa sin perder velocidad de salida

## 🛠️ CRITERIO TÉCNICO RECOMENDADO PARA EL TEMPLATE

La convención recomendada para implementar soft delete en la fábrica SaaS es:

### Campo estándar
- `deleted_at`

### Regla de interpretación
- registro activo → `deleted_at IS NULL`
- registro eliminado lógicamente → `deleted_at IS NOT NULL`

### Motivos de esta elección
Se elige `deleted_at` como convención base porque:

- permite saber cuándo se eliminó el registro
- permite restauración simple
- evita mezclar eliminación con estados de negocio
- escala mejor que un booleano `activo`
- deja preparada la base para papelera, auditoría y limpieza programada

### Comportamiento recomendado del CRUD base

#### `getAll()`
Debe devolver solo registros no eliminados lógicamente.

#### `getById()`
Debe respetar la política del producto, evitando exponer por defecto registros eliminados.

#### `create()`
Debe crear registros con `deleted_at = NULL`.

#### `update()`
Debe modificar registros existentes sin alterar `deleted_at`, salvo operación explícita de restauración.

#### `remove()`
Debe implementar soft delete mediante actualización de `deleted_at`, no mediante `DELETE` físico.

#### `restore()`
Cuando el producto lo necesite, debe restaurar el registro dejando `deleted_at = NULL`.

### Eliminación física
La eliminación física real queda fuera del CRUD base estándar y debe ejecutarse por canal controlado.