# Modelo de Datos Relacional

<!-- GUÍA · Sección 8 de la pauta · Criterio 2.1.4 (10 pts, junto con NoSQL).
Cubre: DER, diccionario, claves, cardinalidades, reglas de integridad; C-02/CAL-02 (propagación a todos o a algunos),
C-06/CAL-03 (clonación), CAL-08 (ciclo de vida y sincronización cada 10 min); cuentas y enlaces; coexistencia (RF-08).
El docente envió el esquema real (Anexo B): este modelo se construye directamente sobre él, "en base al origen
con mejoras", como pidió el cliente. -->

El cliente pidió explícitamente **modelar la base de datos a partir del esquema de origen, con mejoras** — no reemplazarlo por un diseño paralelo. Este modelo toma tal cual las entidades que envió el docente (`sistema`, `perfil`, `transaccion`, `usuario`, `agencia`, `departamento`, `control_ui`, `solicitud_acceso`, `link_activacion`, `bloqueo_registro`, `importacion_ad`, `auditoria`, `permiso_adiciona`, `perfil_transaccion_cambio`) y agrega solo las columnas puntuales que los requerimientos ya acordados con el cliente exigen y que el esquema de origen no trae (detalladas en «Mejoras sobre el Esquema de Origen»).

En este modelo, **un permiso es un registro de `transaccion`** (una opción dentro de una aplicación, por ejemplo «Aprobar» o «Eliminar»), agrupado por `sistema` a través de `sistema_transaccion`. Un **perfil** es un paquete de transacciones de distintos sistemas (`perfil_sistema_transaccion`) que se asigna a una persona de una vez. Cada **usuario** tiene **un solo perfil vigente** (clave foránea directa, no una lista de asignaciones), y las diferencias puntuales respecto de ese perfil se resuelven con **excepciones** (`permiso_adiciona`).

## Diagrama Entidad-Relación

La Figura 23 muestra el esquema completo tal como lo envió el docente. No hay tablas con prefijo `tb_`: estas son las tablas reales del sistema MSC.Security, sin una capa `rbac` paralela.

![Diagrama entidad-relación del esquema de origen enviado por el docente](assets/diagramas/06-der.svg "Figura 23. DER del esquema de origen: catálogo, usuarios, excepciones, acceso y auditoría. Fuente: Esquema provisto por el docente (Anexo B), 2026.")

## Diccionario de Datos

Las tablas usan nombres en español sin prefijos, tal como las envió el docente. Las columnas marcadas **«agregada»** no vienen en el esquema de origen: las suma este diseño para cumplir un requerimiento ya acordado con el cliente (se detalla el porqué en «Mejoras sobre el Esquema de Origen»).

**`sistema`**: una de las 37 aplicaciones satélites.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `nombre`, `codigo` | `varchar(100)`, `varchar(20)` | No | Nombre y sigla de la aplicación. |
| `estado` | `boolean` | No | Baja lógica: da de baja un sistema sin borrar su historial. |

**`agencia`**: sucursal a la que pertenece un usuario. No existía en el modelo de la EVA 1; la entrega el esquema de origen.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `nombre` | `varchar(100)` | No | Nombre de la agencia. |
| `estado`, `fecha_creacion` | `boolean`, `datetime2` | No | Baja lógica y alta. |

**`departamento`**: catálogo propio del sistema, independiente del directorio (N-03). El esquema de origen ya resuelve la causa 3, porque es una tabla propia y no un atributo leído desde AD.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `nombre` | `varchar(100)` | No | Nombre único. |
| `estado` | `boolean` | No | Baja lógica. |

**`control_ui`**: clasifica cada `transaccion` según el control de interfaz al que corresponde (por ejemplo, botón, menú o pantalla).

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `nombre` | `varchar(100)` | No | Nombre del control. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`transaccion`**: catálogo transversal de opciones (Aprobar, Leer, Eliminar...). Es lo que este informe llama **permiso**.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `id_control_ui` | `int` FK | No | A qué control de interfaz corresponde. |
| `nombre` | `varchar(100)` | No | Nombre de la opción. |

**`sistema_transaccion`**: qué transacciones existen realmente en cada sistema; el catálogo válido para armar un perfil.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_sistema`, `id_transaccion` | `int` FK, `int` FK | No | Clave primaria compuesta. |

**`perfil`**: paquete de permisos que se asigna de una vez. Nombre único.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `int` identidad | No | Clave primaria. |
| `nombre` | `varchar(100)` | No | Nombre único. |
| `estado`, `fecha_creacion` | `boolean`, `datetime2` | No | Baja lógica y alta. |
| `rowversion` *(agregada)* | `rowversion` | No | Protege contra dos administradores editando la misma plantilla a la vez (RI-10). |

**`perfil_sistema_transaccion`**: las transacciones que un perfil concede **hoy**. No hay versiones: un cambio aquí es inmediato para todos los usuarios con ese perfil.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_perfil`, `id_sistema`, `id_transaccion` | `int` FK (×3) | No | Clave primaria compuesta. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`usuario`**: identidad y credencial en una sola tabla. Reemplaza a `colaborador` + `cuenta` del diseño de la EVA 1.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `varchar(50)` | No | Clave primaria: el código de AD. Un usuario no existe sin identidad corporativa (CAL-08). |
| `nombre_usuario` | `varchar(50)` | No | Usuario de ingreso al portal. |
| `email` | `varchar(150)` | No | Copiado desde el directorio en cada sincronización. |
| `password_hash` | `varchar(400)` | Sí | *Hash* con sal (PBKDF2), nunca el texto de la contraseña. Nulo hasta que la persona activa su cuenta. El esquema de origen ya trae esta columna; antes de usarla hay que confirmar con el cliente que hoy no guarda la contraseña de forma reversible — el mismo riesgo que R-12 documenta para `tb_usuario.dg_password` en el sistema actual. |
| `rol_plataforma` | `varchar(20)` | No | `ADMINISTRADOR_TI` o `COLABORADOR`. |
| `id_departamento` | `int` FK | Sí | Departamento al que pertenece. |
| `id_agencia` | `int` FK | Sí | Agencia asignada. |
| `id_perfil` | `int` FK | Sí | **El único perfil vigente del usuario** (1:1). Nulo hasta que se aprueba su primera solicitud de acceso. |
| `estado` | `boolean` | No | Baja lógica: activo o inactivo. |
| `intentos_fallidos` | `int` | No | Control de fuerza bruta. |
| `bloqueada_hasta` | `datetime2` *(agregada)* | Sí | Vence el bloqueo tras 5 intentos fallidos (15 minutos). El esquema de origen cuenta los intentos pero no trae esta columna. |
| `sello_seguridad` | `varchar(100)` *(agregada)* | No | Cambia al definir una contraseña nueva, invalidando las sesiones abiertas (RNF-10). |
| `rowversion` | `rowversion` | No | Control de concurrencia (sección 4): dos administradores no pueden modificar al mismo usuario a la vez sin detectarlo. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`permiso_adiciona`**: la excepción — un permiso puntual que se concede o se retira a un usuario, fuera de su perfil.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `bigint` identidad | No | Clave primaria. |
| `id_usuario`, `id_sistema`, `id_transaccion` | FK | No | A quién, sobre qué permiso. |
| `asignado` | `boolean` | No | `true` concede un permiso que el perfil no da; `false` retira uno que el perfil sí da. |
| `motivo` | `nvarchar(500)` | No | Justificación obligatoria. |
| `creado_por` | `varchar(50)` | No | Quién la registró. |
| `fecha_creacion` | `datetime2` | No | Momento del registro. |
| `estado` | `varchar(12)` *(agregada)* | No | `PENDIENTE`, `APROBADA`, `RECHAZADA`, `VENCIDA` o `REVOCADA`. El esquema de origen no trae un flujo de aprobación: esta columna lo habilita (N-09). |
| `aprobado_por` | `varchar(50)` *(agregada)* | Sí | Restricción `CHECK`: distinto de `creado_por` (RI-03, separación de funciones). |
| `fecha_termino` | `date` *(agregada)* | No | Vigencia obligatoria, no más de 180 días (RI-04, propuesta por validar). Sin esta columna, una excepción del esquema de origen no vence nunca. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`auditoria`**: bitácora. Reemplaza a `evento_auditoria` + `adjunto_auditoria` del diseño de la EVA 1, de forma más simple.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `bigint` identidad | No | Clave primaria. |
| `id_usuario` | `varchar(50)` | No | A quién afecta el evento. |
| `accion` | `varchar(30)` | No | Por ejemplo `LOGIN_FALLIDO`, `ACCESO_APROBADO`, `CAMBIO_PERFIL` o `BAJA_AUTOMATICA`. |
| `ejecutado_por` | `varchar(50)` | No | Una persona (su `id` de `usuario`) o `PROCESO_AD_SYNC`. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`solicitud_acceso`** y **`link_activacion`**: flujo de activación.

| Columna de `solicitud_acceso` | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_usuario` | `varchar(50)` FK | No | Quién pide el acceso. |
| `aprobado_por` | `varchar(50)` | Sí | Restricción `CHECK` ya presente en el esquema de origen: distinto de `id_usuario` (nadie aprueba su propia solicitud). |
| `creado_por` *(agregada)* | `varchar(50)` | Sí | Nulo si la creó el propio usuario; si no, quien la creó. Sin esta columna no se puede exigir que el aprobador sea distinto de quien la creó (CB-02), solo que sea distinto del solicitante. |
| `estado` | `varchar(10)` | No | `PENDIENTE`, `APROBADA` o `RECHAZADA`. |

| Columna de `link_activacion` | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_token` | PK | No | Clave primaria. |
| `token_hash` | `binary(32)` | No | *Hash* SHA-256 del enlace; el enlace completo solo existe en el correo. |
| `fecha_vencimiento`, `activo` | `datetime2`, `boolean` | No | Vence a los 15 minutos. Un enlace vencido o ya usado (`activo = false`) no se acepta. |

Al aprobar una solicitud, el perfil elegido se escribe directamente en `usuario.id_perfil`: no hace falta una columna de «perfil inicial» en `solicitud_acceso`, porque el usuario solo tiene un perfil a la vez.

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`bloqueo_registro`**: bloqueo pesimista del sistema original.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `tipo_entidad`, `id_registro` | `varchar`, `varchar` (clave compuesta) | No | Qué se bloqueó: `SISTEMA`, `USUARIO`, `PERFIL` o `TRANSACCION`, y su identificador. |
| `id_usuario_bloqueo` | FK | No | Quién tiene el bloqueo activo. |
| `fecha_inicio_bloqueo`, `fecha_expiracion` | `datetime2` | No | El bloqueo caduca solo (TTL), a diferencia del legado actual, donde un bloqueo podía quedar abierto si alguien cerraba la aplicación sin liberarlo. |

El diseño **no usa este mecanismo** para las operaciones del portal: la sección 4 ya resolvió la concurrencia con bloqueo de fila dentro de la transacción (`UPDLOCK, ROWLOCK`) y verificación de `rowversion`, que es más simple y no depende de que cada cliente recuerde liberar el bloqueo. `bloqueo_registro` se mantiene en el esquema por si algún proceso legado todavía la usa; el motor de permisos no escribe en ella.

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`importacion_ad`**: registro de cada sincronización con el directorio (RNF-13). Reemplaza a `ejecucion_sincronizacion`.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_importacion` | PK | No | Clave primaria. |
| `fecha_ejecucion` | `datetime2` | No | Momento de la corrida. |
| `cantidad_usuarios` | `int` | No | Activos recibidos del directorio. |
| `resultado` | `varchar(20)` | No | `OK` o `FRENO_ACTIVADO`, según si la lista pasó el freno de seguridad de la sección 4. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

**`perfil_transaccion_cambio`**: bitácora de cambios a una plantilla de perfil. No es un mecanismo de versiones — es el registro de auditoría de cada cambio.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id` | `bigint` identidad | No | Clave primaria. |
| `id_perfil`, `id_transaccion` | `int` FK | No | Qué perfil cambió y sobre qué transacción. |
| `agrega` | `boolean` | No | `true` si se agregó la transacción al perfil, `false` si se quitó. |
| `fecha_creacion` | `datetime2` | No | Momento del cambio. |

**`perfil_transaccion_cambio_usuario`**: cada usuario que tenía el perfil cuando se aplicó el cambio, y por lo tanto quedó afectado por él.

| Columna | Tipo | Nulo | Descripción y regla |
| --- | --- | --- | --- |
| `id_cambio` | `bigint` FK | No | A qué cambio corresponde (`perfil_transaccion_cambio`). |
| `id_usuario` | `varchar(50)` FK | No | Usuario afectado por ese cambio. |

Fuente: Elaboración propia a partir del esquema de origen (Anexo B), 2026.

## Claves, Cardinalidades y Reglas de Integridad

Las cardinalidades principales del esquema de origen son:

- Un **departamento** o una **agencia** agrupan cero o más usuarios; cada usuario pertenece como máximo a uno de cada uno.
- Un **perfil** concede cero o más transacciones (vía `perfil_sistema_transaccion`), y es el perfil vigente de cero o más usuarios. **Un usuario tiene como máximo un perfil** — ya no varios a la vez, como proponía el diseño de la EVA 1.
- Un **usuario** puede tener cero o más excepciones (`permiso_adiciona`), solicitudes de acceso, enlaces de activación y eventos de auditoría.
- Un **cambio de perfil** (`perfil_transaccion_cambio`) deja un registro por cada usuario que tenía ese perfil en ese momento (`perfil_transaccion_cambio_usuario`).

Las reglas que la base de datos puede asegurar se implementan como restricciones:

| ID | Regla | Dónde se asegura |
| --- | --- | --- |
| RI-01 | No existe un usuario sin identidad de AD, ni dos con la misma. | `id` de `usuario` es su código de AD y es la clave primaria. |
| RI-02 | Un usuario no tiene más de un perfil vigente. | Ya no es una restricción que validar: `usuario.id_perfil` es una columna, no una tabla de asignaciones; estructuralmente no admite un segundo valor. |
| RI-03 | Quien aprueba una excepción o una solicitud de acceso no es quien la creó. | `CHECK` en `permiso_adiciona.aprobado_por` ≠ `creado_por` (columna agregada); `CHECK` ya presente en el origen para `solicitud_acceso.aprobado_por` ≠ `id_usuario`. |
| RI-04 | Una excepción siempre tiene fecha de término, posterior a su inicio. | `CHECK` y `NOT NULL` sobre `permiso_adiciona.fecha_termino` (columna agregada). |
| RI-05 | Un usuario no tiene a la vez una concesión y un retiro vigentes del mismo permiso. | Validación en el dominio antes de aprobar una excepción nueva. |
| RI-06 | La bitácora no se modifica ni se borra. | Tabla *ledger append-only* de SQL Server 2022; si la versión corporativa no la soporta, `DENY UPDATE, DELETE` y un *trigger* que rechaza ambas operaciones sobre `auditoria`. |
| RI-07 | Ningún cambio de permisos existe sin su evento de auditoría. | El cambio (en `perfil_sistema_transaccion` o `permiso_adiciona`) y el evento en `auditoria` se escriben en la misma transacción. |
| RI-08 | Un perfil, sistema o transacción en uso no se borra. | Claves foráneas sin borrado en cascada; los registros se desactivan con su columna `estado`. |
| RI-09 | Ninguna contraseña se guarda en forma legible. | Solo se escribe el *hash* en `usuario.password_hash`; pendiente confirmar con el cliente qué guarda hoy esa columna en producción (ver «Brechas Pendientes»). |
| RI-10 | Dos operaciones no modifican al mismo usuario o perfil al mismo tiempo. | Bloqueo de fila al inicio de la transacción y verificación de `rowversion`, tanto en `usuario` (ya la trae el origen) como en `perfil` (columna agregada). |

Fuente: Elaboración propia (2026).

## Reglas de Negocio: Propagación y Clonación

Esta subsección responde a los compromisos C-02 y C-06, reformulados para el esquema de origen: como un usuario tiene un solo perfil (sin versiones), el administrador **elige el alcance de cada cambio** entre dos vías, no entre versiones.

> Permisos efectivos de un usuario = (permisos de su perfil vigente, vía `perfil_sistema_transaccion`) + (concesiones vigentes en `permiso_adiciona`) − (retiros vigentes en `permiso_adiciona`). Si el usuario está inactivo, sus permisos efectivos son vacíos.

**Regla de propagación al modificar un perfil (C-02, CAL-02), con las dos vías que pidió el cliente:**

1. **A todos los colaboradores del perfil.** El cambio se escribe en `perfil_sistema_transaccion`: es inmediato para todos los que tienen ese perfil hoy, y para cualquiera que lo reciba después. Se registra en `perfil_transaccion_cambio`, con una fila en `perfil_transaccion_cambio_usuario` por cada colaborador que tenía el perfil en ese momento.
2. **Solo a los colaboradores seleccionados.** El perfil **no cambia**: se crea una excepción (`permiso_adiciona`) por cada colaborador elegido — `asignado = true` si se agrega la transacción, `false` si se retira. Los demás colaboradores del mismo perfil, y quien lo reciba después, no se ven afectados. En la práctica, esta vía es una pantalla de conveniencia para crear varias excepciones iguales de una vez, en lugar de una por una desde «Excepciones».
3. **Ambas vías se aplican en una sola transacción.** Si el cambio incluye a varios colaboradores (por plantilla o por excepción), falla para todos o se aplica a todos.
4. **Se registra quién fue afectado**, por cualquiera de las dos vías: `perfil_transaccion_cambio_usuario` para la vía 1, el propio `permiso_adiciona.creado_por`/`fecha_creacion` para la vía 2, y un evento en `auditoria` en ambos casos.

La diferencia con el diseño de la EVA 1 es que ya no existe una «versión del perfil» que unos reciban y otros no: aplicar **a todos** cambia la definición compartida del perfil (y alcanza también a quien lo reciba más adelante); aplicar **a algunos** nunca toca esa definición — solo agrega excepciones puntuales a los colaboradores elegidos. El cliente pidió modelar sobre el esquema real, y ese esquema no versiona los perfiles; esta es la forma de ofrecer la misma elección («a todos o solo a algunos») sin inventar una tabla de versiones que el origen no tiene.

**Definición operativa de la clonación (C-06, CAL-03):**

1. **Qué se copia:** el **perfil vigente** del usuario de referencia que el administrador seleccione. Como cada usuario tiene un solo perfil, clonar es tan simple como asignar el mismo `id_perfil` al destino — es lo que pide la jefatura: «para Abraham, los mismos permisos que para Pablo».
2. **Qué no se copia:** las **excepciones** (`permiso_adiciona`). Son individuales y fueron aprobadas para otra persona; si el destino necesita una, se solicita como excepción nueva.
3. **Si la referencia cambia después:** no afecta al destino, porque cada uno tiene su propia fila en `usuario.id_perfil`.
4. **Qué se registra:** un evento `CAMBIO_PERFIL` en `auditoria`, con referencia, destino, perfil anterior y nuevo del destino, motivo y ticket.

**Ciclo de vida del usuario (CAL-08).** Replica el proceso actual del cliente:

- **Alta de la identidad:** la sincronización (`importacion_ad`) crea el `usuario` cuando aparece en la lista de activos del directorio, sin `id_perfil` ni `password_hash`.
- **Activación de la cuenta:** `solicitud_acceso` → aprobación por alguien distinto del solicitante → `link_activacion` → definición de la contraseña → se asigna `id_perfil`.
- **Baja automática:** si el usuario deja de aparecer en la lista de activos, la siguiente sincronización (máximo 10 minutos) lo desactiva (`estado = false`); sus permisos efectivos quedan vacíos porque la condición `usuario.estado` se evalúa en cada cálculo.
- **Freno de seguridad:** si `importacion_ad` recibe una lista con más de un 5 % menos de activos que la corrida anterior, el resultado queda `FRENO_ACTIVADO`, no se desactiva a nadie y se avisa a TI.
- **Baja manual (HU10):** TI puede desactivar a un usuario antes de que el directorio lo refleje, cambiando `estado` directamente.

## Mejoras sobre el Esquema de Origen

El cliente pidió modelar sobre el esquema real **con mejoras**. La siguiente tabla resume, tabla por tabla, qué trae el origen tal cual y qué agrega este diseño:

| Tabla del origen | Mejora que agrega el diseño | Para qué requerimiento |
| --- | --- | --- |
| `usuario` | Columnas `bloqueada_hasta` y `sello_seguridad`. | Bloqueo tras 5 intentos fallidos y revocar sesiones al cambiar la contraseña (N-11, RNF-10). |
| `perfil` | Columna `rowversion`. | Que dos administradores no editen la misma plantilla a la vez sin detectarlo (RI-10). |
| `permiso_adiciona` | Columnas `estado`, `aprobado_por` y `fecha_termino`. | Flujo de aprobación, separación de funciones y vigencia obligatoria de las excepciones (N-05, N-09, RI-03, RI-04). |
| `solicitud_acceso` | Columna `creado_por`. | Que el aprobador sea distinto de quien creó la solicitud, no solo del solicitante (CB-02). |
| — | Motor de permisos y proyección en memoria (sección 4), con caché en Redis (sección 8). | El esquema de origen no trae una tabla de permisos ya calculados; sin ella, cada consulta de un satélite tendría que unir `perfil_sistema_transaccion` y `permiso_adiciona` en el momento. El motor la recalcula solo cuando algo cambia (N-04, RNF-01). |
| — | Tablas `campana_recertificacion` y `decision_recertificacion`. | El origen no trae un mecanismo de recertificación periódica; estas tablas nuevas, vinculadas a `usuario` y a `departamento`, sostienen HU06 y HU11 tal como se describen en la sección 2. |

Fuente: Elaboración propia (2026).

**`campana_recertificacion`** y **`decision_recertificacion`** (agregadas, para HU06 y HU11): una campaña pertenece a un `departamento` y está `ABIERTA` o `CERRADA`; cada decisión registra, para un `usuario` y un permiso (perfil o excepción), si se confirma o se revoca, quién decidió y cuándo. No reemplazan nada del esquema de origen: se apoyan en él (referencian `usuario.id` y `departamento.id`) de la misma forma en que `campana_recertificacion`/`decision_recertificacion` se apoyaban en `rbac.colaborador` en el diseño de la EVA 1.

## Brechas Pendientes de Confirmar con el Cliente

El esquema de origen resuelve casi todo el modelo, pero quedan puntos que no se pueden cerrar sin información que solo el cliente tiene:

- **Naturaleza real de `usuario.password_hash`.** Hay que confirmar si hoy guarda un *hash* seguro o una contraseña reversible, igual que el riesgo R-12 ya documentado para `tb_usuario.dg_password` en el sistema legado. Mientras no se confirme, el diseño asume que debe reescribirse con PBKDF2 al migrar.
- **Si algún satélite autentica directamente contra `usuario.password_hash`.** De ser así, vaciarla o rehashearla rompería esa aplicación (mismo riesgo R-12).
- **Adjuntos de las excepciones (HU03).** La pantalla de excepciones permite adjuntar un archivo de respaldo de hasta 5 MB, pero ni `permiso_adiciona` ni ninguna otra tabla del origen tienen una columna para esto. Falta definir con el cliente dónde se guarda (¿una tabla nueva, un *blob storage* externo?) antes de implementarlo.

Fuente: Elaboración propia (2026).
