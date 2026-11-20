# Lámina 12 · Las Pantallas que Resuelven el Problema

![Lámina 12 de la presentación: wireframes de comparar y clonar y de Mis permisos](assets/laminas/10.png "Figura 2. Lámina 12 de la presentación de la defensa. Fuente: Elaboración propia (2026).")

## Lo que Dicen las Notas del PowerPoint

> «Diseñamos ocho pantallas. Destacamos dos. A la izquierda, comparar y clonar: reemplaza la doble ventana. Se eligen dos personas, se ven las diferencias lado a lado y se copia el perfil con un clic, pidiendo motivo y ticket. A la derecha, Mis permisos, el requisito nuevo que usted nos pidió: cada colaborador ve a qué aplicaciones tiene acceso y de dónde viene cada permiso. Es solo de lectura. Cada pantalla indica qué requisito cubre, qué valida y qué mensaje muestra si algo falla. Ocultar un botón es solo una ayuda: todo se vuelve a verificar en el servidor.»

## Guion para Decir

**Introducción:**

> «En total diseñamos ocho pantallas, que están abajo en la lámina. Les quiero mostrar las dos más importantes.»

**Comparar y clonar** (señala la pantalla de la izquierda):

> «La de la izquierda es la que más le importa a TI: **comparar y clonar**. Reemplaza la famosa doble ventana. Antes, para darle a una persona los mismos permisos que a un compañero, había que abrir dos ventanas y comparar casilla por casilla. Ahora se eligen las dos personas en una sola pantalla, el sistema marca qué tienen igual y qué es distinto, y con un clic se le copia el perfil de su compañero. Se pide un motivo y un número de ticket, para que quede registrado.
>
> Un detalle importante: se copia el **perfil**, no las excepciones. Cada persona tiene un solo perfil, así que el del destino se reemplaza por el de la referencia. Las excepciones son permisos personales que se aprobaron para otra persona; si el nuevo las necesita, la misma pantalla le ofrece solicitarlas, y pasan por aprobación.»

**Mis permisos** (señala la pantalla de la derecha):

> «La de la derecha es **Mis permisos**, el requisito nuevo que usted nos pidió en la entrevista. Cada colaborador ve a qué aplicaciones tiene acceso, con qué permiso y de dónde viene cada uno: de un perfil o de una excepción, con su fecha de vencimiento. Es solo de lectura, y desde aquí mismo puede cambiar su contraseña con el mismo enlace por correo.»

**Cierre del bloque:**

> «Todas las pantallas indican qué requerimiento cubren, qué validan y qué mensaje muestran si algo falla: definimos 16 mensajes de error. Y algo importante de seguridad: ocultar un botón es solo una ayuda visual; cada acción se vuelve a verificar en el servidor.»

> **Señala en la lámina:** en clonación, la tabla del perfil vigente (columna «Destino después de clonar») y la fila de la excepción con «No se copia · Solicitar como excepción»; en Mis permisos, la columna «Origen» y el botón «Cambiar mi contraseña»; al final, la franja con las 8 pantallas.

**Pase al bloque 5:**

> «Detrás de todas estas pantallas hay un modelo de datos que hace que funcionen. Para explicarlo, le doy el pase a [nombre de quien presenta el bloque 5].»

## Explicación Adicional

**Las 8 pantallas, con su historia y requerimiento.** Esta es la pregunta más probable del profesor:

| Pantalla | Para quién | Historias | Requerimiento | Necesidad |
| --- | --- | --- | --- | --- |
| Inicio de sesión y definir contraseña | Todos | HU13, HU15, HU17, HU18 | RF-13, RF-15, RF-16, RF-17 | N-11 |
| Mis permisos | Colaborador | HU14 | RF-14 | N-10 |
| Solicitudes de acceso | Administrador TI | HU16 | RF-15 | N-09 |
| Ficha del colaborador | Administrador TI | HU01, HU10 | RF-02, RF-09 | N-01, N-08 |
| Comparar y clonar | Administrador TI | HU02, HU08 | RF-03 | N-02 |
| Excepciones | Administrador TI | HU03, HU09 | RF-04, RF-11 | N-05, N-09 |
| Plantilla de perfil | Administrador TI | HU07 | RF-01 | N-01 |
| Bitácora | Administrador TI | HU04 | RF-06 | N-06 |

Fuente: Elaboración propia a partir de la sección 6 del informe (2026).

**Sobre comparar y clonar:**

- Es la pantalla que atiende la **necesidad más importante del cliente** (N-02, eliminar la doble ventana). Si el profesor pregunta «¿qué componente soporta la necesidad más importante?», esta es la respuesta.
- Copia el **perfil vigente** de la persona de referencia, para que el destino quede con los mismos permisos. La jefatura lo pide así: «para Abraham, los mismos permisos que para Pablo».
- Si después cambia la persona de referencia, el destino **no cambia**: la clonación es una copia en un momento dado.
- Validaciones: las dos personas deben estar activas y ser distintas (ERR-07), y el motivo y el ticket son obligatorios (ERR-03). Si otro administrador modificó al destino mientras tanto, se rechaza y se pide recargar (ERR-05).
- El informe tiene un diagrama de flujo propio de esta tarea (Figura 7), con sus caminos de error.

**Sobre Mis permisos:**

- Cubre la necesidad N-10, que salió de la entrevista del 14-11. El profesor dijo que agregarla «suma».
- **Solo lectura:** el colaborador no puede pedir permisos desde el portal; eso quedó como *Won't Have* (W-02). Si necesita otro acceso, lo pide a su jefatura o a la mesa de ayuda.
- **Seguridad:** la API toma la identidad desde la sesión, no desde lo que envía la pantalla. Si alguien cambia el identificador para ver los permisos de otra persona, recibe un 403 (RNF-11, prueba CP-37).

**Criterios de diseño por Citrix (RNF-06):**

- Resolución mínima de 1366 × 768 y sin animaciones, porque las sesiones de Citrix tienen recursos limitados.
- Tablas paginadas en el servidor, de 50 filas por página.
- Todo se puede usar solo con teclado.
- Confirmación explícita antes de cualquier acción que quite permisos.

**Las pantallas que no se muestran:** aplicaciones, departamentos y recertificación quedan para la EVA 4. Sus flujos ya están definidos en la sección 6.1 y reutilizan los mismos componentes: formulario y tabla.

**Por qué los wireframes son de baja fidelidad:** porque en esta etapa se evalúa qué información se ve, qué acciones existen y qué errores se informan, no los colores ni el diseño final. Los números en círculos negros de cada wireframe marcan dónde hay una validación o un mensaje de error.
