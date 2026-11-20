# MVP y Priorización

<!-- GUÍA · Sección 3 de la pauta.
Cubre: épicas HU01/HU02 divididas; historias de baja, acceso y vista personal; RF-13..RF-18 (cliente, 14-11);
mapeo con los identificadores provisionales del equipo (RF-N, RNF-N); «Won't have» explícitos. -->

## Producto Mínimo Viable

El MVP se formula en una frase:

> Un portal web con credenciales propias en el que TI aprueba accesos, asigna perfiles en vez de permisos sueltos, compara y copia los perfiles de un colaborador a otro en una sola pantalla y gestiona excepciones aprobadas por otro administrador, mientras cada colaborador consulta sus propios permisos, con cada cambio registrado en una bitácora inmutable y servido a las aplicaciones satélites mediante un endpoint REST, en reemplazo de los procedimientos y vistas legados.

El MVP corresponde a lo que se construye y prueba para la EVA 3. Cubre todas las necesidades salvo N-03 (catálogo de departamentos) y la parte de revisión periódica de N-08, que se diseñan completas en este informe pero se construyen en el incremento siguiente (EVA 4). Ningún elemento del alcance aprobado se elimina: solo se ordena su construcción.

## Requerimientos Incorporados tras la EVA 1

Los requerimientos RF-01 a RF-11 y RNF-01 a RNF-07 se mantienen; los no funcionales siguen clasificados según la norma ISO/IEC 25010 (International Organization for Standardization, 2011). Tres de ellos se modifican y se agregan los siguientes. La columna «ID provisional» indica el identificador que el equipo usó en su documento de trazabilidad del 15-11-2026.

| ID | Requerimiento | ID provisional | Origen | MoSCoW |
| --- | --- | --- | --- | --- |
| RF-09 | Dar de baja todos los accesos de un colaborador, o los de su perfil anterior cuando cambia de perfil, en una operación auditada. | — | CAL-06 | Must Have |
| RF-10 | Campañas de recertificación en las que TI confirma o revoca los accesos vigentes de un área, con evidencia. | — | CAL-06 | Should Have |
| RF-11 | Toda excepción queda pendiente hasta que la apruebe un administrador distinto de quien la solicitó, y tiene fecha de término. | — | CAL-07 | Must Have |
| RF-12 *(modificado)* | Cada 10 minutos, comparar la lista de identidades activas del directorio corporativo con las registradas: crear las nuevas sin cuenta y desactivar, con sus permisos, a las que ya no estén. Si la lista llega anormalmente incompleta, no desactivar a nadie y avisar. | RF-12 modificado | Cliente, CAL-08 | Must Have |
| RF-13 | Iniciar sesión con usuario y contraseña propios del portal; bloquear la cuenta tras varios intentos fallidos. | RF-N01 | Cliente | Must Have |
| RF-14 | Cada colaborador consulta, en solo lectura, sus aplicaciones y permisos con su origen. | RF-N02 | Cliente | Must Have |
| RF-15 | Una persona cuya identidad existe en el directorio solicita acceso; un administrador, distinto de quien creó la solicitud, la aprueba y asigna el perfil inicial en el mismo paso. | RF-N03 | Cliente, CAL-07 | Must Have |
| RF-16 | La contraseña se define y se cambia solo mediante un enlace de un solo uso enviado al correo corporativo, que vence; al usarlo se invalidan los enlaces anteriores y las sesiones abiertas. | RF-N04 | Cliente | Must Have |
| RF-17 | Recuperar la contraseña mediante el mismo tipo de enlace, sin revelar si la cuenta existe. | RF-N05 | Cliente | Must Have |
| RF-18 | Mantener el catálogo de aplicaciones: alta, edición y baja lógica. | — | Tablero del equipo | Should Have |
| RNF-01 *(modificado)* | P95 menor a 20 ms del endpoint, condicionado a la infraestructura confirmada y medido con 600 consumidores concurrentes (sección 10). | RNF-01 modificado | Cliente, CAL-04 | — |
| RNF-03 *(modificado)* | Autenticación con credenciales propias; el directorio entrega identidades, no autentica. Comunicación cifrada con TLS. | RNF-03 modificado | Cliente | — |
| RNF-08 | Disponibilidad y continuidad: objetivos, RTO, RPO y modo degradado ante caída de Redis (sección 5). | — | CAL-05 | — |
| RNF-09 | Ninguna credencial en el repositorio ni en la configuración versionada, con rotación declarada (secciones 5 y 9). | — | CAL-09 | — |
| RNF-10 | Contraseñas solo como hash seguro: nunca en texto plano, reversibles ni visibles para TI. | RNF-N10 | Cliente, legado | — |
| RNF-11 | La API limita cada consulta del colaborador a sus propios datos. | RNF-N11 | Cliente | — |
| RNF-12 | Los enlaces son de un solo uso, vencen y no revelan si existe la cuenta o el correo consultado. | RNF-N12, RNF-N13 | Equipo | — |
| RNF-13 | Cada sincronización registra su resultado y los cambios realizados. | RNF-N14 | Equipo | — |

Fuente: Elaboración propia a partir de la entrevista del 14-11-2026 y del documento de trazabilidad del equipo (2026).

**Una decisión respecto del documento del equipo.** El documento de trazabilidad (HU-N03) proponía activar la cuenta automáticamente, sin aprobación de TI, y enviar una contraseña inicial por correo. Este diseño adopta en cambio la versión del tablero del equipo: **un administrador aprueba la solicitud y se envía un enlace para que la persona defina su propia contraseña**. Se elige así por tres razones: la aprobación es el momento en que se asigna el perfil inicial; cumple la separación de funciones exigida por CAL-07; y evita que una contraseña real viaje por correo.

## Backlog Priorizado

Las épicas de la EVA 1 se dividen: la plantilla del perfil pasa de HU01 a HU07, y la clonación pasa de HU02 a HU08. HU12 cambia de alcance (sincronización con el directorio en lugar de alta manual desde Entra ID), y HU13 a HU19 son nuevas. En HU05 el sistema satélite es el medio de consumo, pero el valor lo recibe el equipo que opera esas aplicaciones.

| ID | Historia (resumen) | RF | Necesidad | MoSCoW | Hito |
| --- | --- | --- | --- | --- | --- |
| HU13 | Como usuario del portal, quiero iniciar sesión con usuario y contraseña propios, para acceder a lo que me corresponde. | RF-13 | N-11 | Must | 1 |
| HU15 | Como colaborador existente en el directorio, quiero solicitar acceso al portal, para obtener mi cuenta sin depender de un correo a TI. | RF-15 | N-09 | Must | 1 |
| HU16 | Como Administrador TI, quiero aprobar o rechazar solicitudes de acceso asignando el perfil inicial, para habilitar a la persona en un solo paso. | RF-15 | N-01, N-09 | Must | 1 |
| HU17 | Como usuario, quiero definir y cambiar mi contraseña con un enlace de un solo uso, para que nadie más la conozca. | RF-16 | N-11 | Must | 1 |
| HU18 | Como usuario que olvidó su contraseña, quiero restablecerla con un enlace seguro, para recuperar el acceso. | RF-17 | N-11 | Must | 1 |
| HU12 | Como Administrador TI, quiero que las identidades se sincronicen solas con el directorio cada 10 minutos, para que quien sale de la empresa pierda el acceso sin intervención manual. | RF-12 | N-08 | Must | 1 |
| HU07 | Como Administrador TI, quiero definir los permisos que incluye cada perfil y elegir a quién aplicar sus cambios, para no asignar aplicación por aplicación. | RF-01 | N-01 | Must | 2 |
| HU01 | Como Administrador TI, quiero asignar un perfil a un colaborador, para otorgar sus permisos en una sola operación. | RF-02 | N-01 | Must | 2 |
| HU02 | Como Administrador TI, quiero comparar los permisos de dos usuarios en una sola vista, para ver diferencias sin la doble ventana. | RF-03 | N-02 | Must | 2 |
| HU08 | Como Administrador TI, quiero clonar los permisos de un usuario de referencia registrando el motivo, para replicar un permiso en un paso. | RF-03, RF-06 | N-02, N-06 | Must | 2 |
| HU03 | Como Administrador TI, quiero solicitar un permiso fuera del perfil con justificación, ticket y fecha de término, para atender casos especiales. | RF-04 | N-05 | Must | 2 |
| HU09 | Como Administrador TI, quiero aprobar o rechazar las excepciones solicitadas por otro administrador, para que nadie conceda privilegios por sí solo. | RF-11 | N-09 | Must | 2 |
| HU10 | Como Administrador TI, quiero dar de baja o cambiar de perfil a un colaborador, para no dejar permisos residuales. | RF-09 | N-08 | Must | 2 |
| HU14 | Como colaborador, quiero ver mis aplicaciones y permisos, para saber a qué tengo acceso. | RF-14 | N-10 | Must | 3 |
| HU05 | Como equipo de las aplicaciones satélites, quiero consultar los permisos efectivos de un usuario con baja latencia, para autorizar en tiempo real consumiendo el nuevo endpoint. | RF-05, RF-08 | N-04, N-07 | Must | 3 |
| HU04 | Como Administrador TI, quiero consultar y filtrar la bitácora en solo lectura, para reconstruir la trazabilidad ante una auditoría o incidente. | RF-06 | N-06 | Must | 4 |
| HU19 | Como Administrador TI, quiero mantener el catálogo de aplicaciones, para registrar las que se incorporan o se retiran. | RF-18 | N-01 | Should | 3 |
| HU06 | Como Administrador TI, quiero mantener el catálogo de departamentos, para organizar los perfiles sin depender del directorio. | RF-07 | N-03 | Should | EVA 4 |
| HU11 | Como Administrador TI, quiero recertificar periódicamente los accesos de un área, para retirar los que ya no corresponden. | RF-10 | N-08 | Should | EVA 4 |

Fuente: Elaboración propia (2026).

Los criterios de aceptación de las historias originales se mantienen. Los de las historias nuevas o modificadas son los siguientes:

- **HU13:** (1) el mensaje de error es el mismo si falla el usuario o la contraseña; (2) tras 5 intentos fallidos la cuenta se bloquea 15 minutos; (3) cada intento fallido queda en la bitácora.
- **HU15 y HU16:** (1) solo puede solicitar acceso una identidad activa en el directorio; (2) quien creó la solicitud no puede aprobarla; (3) al aprobar se crea la cuenta, se asigna el perfil inicial y se envía el enlace, todo en una operación.
- **HU17 y HU18:** (1) el enlace es de un solo uso y vence a los 15 minutos; (2) si vence y el acceso ya estaba aprobado, se puede reenviar sin una nueva aprobación; (3) al definir la contraseña se invalidan los enlaces anteriores y se cierran las sesiones abiertas; (4) la recuperación responde lo mismo exista o no la cuenta.
- **HU12:** (1) quien desaparece de la lista de activos queda desactivado, sin permisos efectivos, en un máximo de 10 minutos; (2) cada baja automática queda en la bitácora como realizada por el proceso; (3) si la lista trae más de un 5 % menos de activos que la ejecución anterior, no se desactiva a nadie y se avisa a TI.
- **HU07:** (1) el administrador elige aplicar el cambio a todos los colaboradores del perfil o solo a los que seleccione, en una sola transacción; (2) «a todos» cambia la plantilla (`perfil_sistema_transaccion`) y queda un registro por cada colaborador afectado; (3) «a algunos» no toca la plantilla: crea una excepción por cada colaborador elegido, sin afectar al resto ni a quien reciba el perfil después.
- **HU08:** (1) se copia el perfil vigente del usuario de referencia al destino; (2) la confirmación exige motivo y ticket; (3) la bitácora registra referencia, destino, perfil anterior y nuevo.
- **HU09:** (1) la excepción no se aplica antes de ser aprobada; (2) el solicitante no puede aprobarla; (3) el rechazo exige motivo.
- **HU10:** (1) la baja revoca el perfil y las excepciones del colaborador en una transacción; (2) el cambio de perfil reemplaza al anterior de forma directa, sin un estado intermedio con ambos vigentes; (3) queda en la bitácora con su ticket.
- **HU14:** (1) el colaborador ve solo sus propios permisos, aunque manipule la solicitud a la API; (2) no hay ninguna acción de modificación; (3) desde la misma pantalla puede pedir el cambio de contraseña.

## Qué Queda Fuera del MVP y Por Qué

Tres historias *Should Have* se diseñan en este informe y se construyen después del MVP:

- **HU19 (catálogo de aplicaciones):** el MVP funciona con las 37 aplicaciones ya registradas en el catálogo legado. Mantenerlo desde el portal es útil, pero no bloquea ninguna otra historia.
- **HU06 (departamentos):** para el MVP, los departamentos se cargan como datos semilla.
- **HU11 (recertificación):** depende de que existan asignaciones, bajas y bitácora en funcionamiento. La parte urgente de N-08, retirar accesos al egreso, sí está en el MVP con HU10 y HU12.

Los siguientes elementos se clasifican como *Won't Have* en este proyecto:

| ID | Elemento excluido | Motivo |
| --- | --- | --- |
| W-01 | Integración bidireccional automática con RRHH | Excede el plazo; las salidas se detectan por la sincronización con el directorio (HU12). |
| W-02 | Solicitudes de permisos por parte de los colaboradores | Los colaboradores solo solicitan acceso al portal y consultan; los permisos los gestiona TI. |
| W-03 | Interfaz para dispositivos móviles | El personal trabaja en estaciones fijas dentro de Citrix. |
| W-05 | Inicio de sesión con la cuenta corporativa de Microsoft (Entra ID) | Decisión del cliente: registrar la aplicación en Entra ID agrega una complejidad que no se justifica. |

Fuente: Elaboración propia a partir de la EVA 1 y de la entrevista del 14-11-2026 (2026).

La modificación del código de las 37 aplicaciones satélites para consumir el endpoint ya no se clasifica como *Won't Have*: es un punto en conversación con el cliente (Anexo B), no una exclusión cerrada.
