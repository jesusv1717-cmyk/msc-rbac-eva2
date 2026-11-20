# Cronograma y Metodología

<!-- GUÍA · Sección 4 de la pauta · Criterio 2.1.1 (10 pts).
Cubre: C-01 (semanas con fechas, hitos EVA 2/3/4, responsable por funcionalidad, Definition of Done por hito).
Hitos = los requerimientos funcionales más importantes con sus tareas y responsables (indicación del docente).
Las tareas citan entre paréntesis el número del ítem en el tablero del equipo (GitHub Projects).
PENDIENTE: integrante de cada rol (tabla 3.2) y fechas de los sprints 1 a 5, EVA 3 y EVA 4. -->

## Enfoque Metodológico

El equipo mantiene el marco ágil híbrido declarado en la EVA 1: sprints quincenales al estilo Scrum, con planificación al inicio y revisión y retrospectiva al cierre, más un tablero Kanban que limita el trabajo en curso. El tablero vive en GitHub Projects, organizado por hitos; el docente indicó que la cuenta de INACAP también da acceso a Azure DevOps, que se mantiene como alternativa equivalente.

El código se integra con *Trunk-Based Development*: ramas de vida corta por tarea (por ejemplo, `feat/HU08-clonacion`) que se fusionan a la rama principal mediante un *pull request* aprobado por un integrante distinto del autor. El docente actúa como *Product Owner* y contraparte de MSC Chile, y cada revisión de sprint se usa para validar con él los criterios de aceptación.

## Roles del Equipo

El docente aclaró que los «roles y perfiles» de la EVA 2 se refieren a los integrantes del equipo. Los roles se mantienen respecto de la EVA 1, y cada uno es responsable de un área del diseño y de la construcción. Los estándares que aplica cada rol están en la sección 9.

| Rol | Integrante | Responsabilidad |
| --- | --- | --- |
| Arquitectura y Backend Lead | [Confirmar] | Arquitectura 4+1, contratos de la API y lógica de negocio en .NET 10. |
| Frontend Lead y UI/UX | [Confirmar] | Flujos, wireframes y SPA en React optimizada para Edge en Citrix. |
| Base de Datos y Rendimiento | [Confirmar] | Modelo relacional, concurrencia, Redis y prueba de carga. |
| Requerimientos y Análisis Funcional | [Confirmar] | Backlog, reglas de negocio, línea base, entrevistas y trazabilidad. |
| Ciberseguridad y Auditoría | [Confirmar] | Autenticación, contraseñas, roles del portal, bitácora y estándares seguros. |
| Scrum Master, DevOps y QA Lead | José Morales | Ceremonias, repositorio, pipeline, ambiente local, datos sintéticos y plan de pruebas. |

Fuente: Elaboración propia a partir de la sección 5.2 del informe de la EVA 1 (2026).

## Hitos

Siguiendo la indicación del docente, cada hito agrupa los requerimientos funcionales más importantes y se cierra con una prueba de punta a punta. Los hitos corresponden a los grupos del tablero del equipo:

| Hito | Requerimientos principales | Historias | Cierre (prueba del hito) | Sprint |
| --- | --- | --- | --- | --- |
| **H1. Acceso y cuentas** | RF-13, RF-15, RF-16, RF-17, RF-12 | HU13, HU15, HU16, HU17, HU18, HU12 | Solicitar acceso, aprobarlo con otro administrador, definir la contraseña con el enlace, ingresar y comprobar que un enlace vencido no sirve; simular que AD deja de traer a un usuario y que se desactiva solo. | 1 |
| **H2. Permisos y perfiles** | RF-01, RF-02, RF-03, RF-04, RF-11, RF-09 | HU07, HU01, HU02, HU08, HU03, HU09, HU10 | Aplicar un cambio de perfil solo a algunos usuarios y verificar que los demás no cambiaron; modificar el mismo usuario desde dos servidores y verificar el rechazo controlado. | 2 |
| **H3. Vista personal y migración** | RF-14, RF-05, RF-08 | HU14, HU05 | Entrar como colaborador y ver solo lo propio; comparar que el endpoint entrega exactamente los mismos permisos que el modelo legado. | 3 |
| **H4. Registro, seguridad y rendimiento** | RF-06, RNF-01, RNF-04 | HU04 | Intentar borrar un registro de la bitácora y llamar a la API sin permiso; prueba de carga con 600 consumidores concurrentes. | 3 |

Fuente: Elaboración propia a partir del tablero del equipo (2026).

## Tareas, Responsables y Dependencias

Las tareas se derivan de los hitos. El número entre paréntesis corresponde al ítem del tablero del equipo. La bitácora se construye en el sprint 1 y no en el hito 4, porque el hito 1 ya necesita registrar los inicios de sesión fallidos y las bajas automáticas.

| ID | Tarea | Hito | Responsable | Depende de | Sprint |
| --- | --- | --- | --- | --- | --- |
| T-01 | Completar la línea base y entrevistar a RRHH | CAL-01, C-04 | Requerimientos | — | 0 |
| T-02 | Diseñar la arquitectura 4+1 y la infraestructura | EVA 2 | Arquitectura | — | 0 |
| T-03 | Diseñar flujos y wireframes | EVA 2 | Frontend | — | 0 |
| T-04 | Diseñar el modelo de datos y las reglas de negocio | EVA 2 | Base de Datos | — | 0 |
| T-05 | Definir roles, estándares y política de credenciales | EVA 2 | Ciberseguridad | — | 0 |
| T-06 | Elaborar el plan de pruebas | EVA 2 | QA | T-03, T-04, T-05 | 0 |
| T-07 | Consolidar la trazabilidad y el informe | EVA 2 | Requerimientos | T-02 a T-06 | 0 |
| T-08 | Repositorio, pipeline, ambiente local (SQL Server, Redis, correo de prueba, API de AD simulada) y secretos fuera del código (#52) | H1 | DevOps | T-02 | 1 |
| T-09 | Esquema relacional, bitácora *append-only* y datos sintéticos (#49) | H1 | Base de Datos | T-04, T-08 | 1 |
| T-10 | Inicio de sesión propio con hash, bloqueo por intentos y sesión compartida entre servidores (#1, #8, #13, #48) | H1 | Ciberseguridad y Backend | T-09 | 1 |
| T-11 | Solicitud y aprobación de acceso con perfil inicial (#2 a #5) | H1 | Backend y Frontend | T-10 | 1 |
| T-12 | Enlaces de un solo uso: activación, reenvío, cambio y recuperación (#6, #7, #9, #10) | H1 | Backend y Ciberseguridad | T-10 | 1 |
| T-13 | Sincronización con AD cada 10 minutos, freno de seguridad y resumen diario (#11, #12, #15 a #19) | H1 | Backend y Base de Datos | T-09 | 1 |
| T-14 | Pruebas del hito 1 (#14, #20) | H1 | QA | T-11 a T-13 | 1 |
| T-15 | Perfiles con aplicación de cambios a todos o a algunos colaboradores (#21, #23, #24) | H2 | Backend y Frontend | T-09 | 2 |
| T-16 | Asignación, cambio de perfil y baja (#22) | H2 | Backend | T-15 | 2 |
| T-17 | Concurrencia: bloqueo de fila, rechazo controlado y aviso de edición (#25, #26) | H2 | Base de Datos y Backend | T-15 | 2 |
| T-18 | Comparar y clonar (#27 a #29) | H2 | Frontend y Backend | T-16 | 2 |
| T-19 | Excepciones aprobadas por otro administrador (#30 a #32) | H2 | Backend y Ciberseguridad | T-16 | 2 |
| T-20 | Pruebas del hito 2 (#33) | H2 | QA | T-15 a T-19 | 2 |
| T-21 | Mis permisos y cambio de contraseña (#34 a #37) | H3 | Frontend | T-12, T-16 | 3 |
| T-22 | Endpoint, caché Redis con versión y modo degradado (#39, #44, #45) | H3 | Base de Datos y Backend | T-16 | 3 |
| T-23 | Prueba de regresión de migración: comparar la tabla legada con el endpoint (#40, #41) | H3 | Base de Datos | T-22 | 3 |
| T-24 | Consulta de la bitácora y autorización en el servidor de todos los endpoints (#47, #50, #51) | H4 | Frontend y Ciberseguridad | T-09 | 3 |
| T-25 | Prueba de carga y pruebas de los hitos 3 y 4 (#42, #43, #46, #53) | H3, H4 | QA y Base de Datos | T-22, T-24 | 3 |
| T-26 | Catálogo de aplicaciones (#38) | EVA 4 | Frontend | T-25 | 4 |
| T-27 | Catálogo de departamentos y recertificación de accesos | EVA 4 | Frontend y Ciberseguridad | T-25 | 4 |
| T-28 | Contrastar resultados con la línea base y cerrar el proyecto | EVA 4 | Requerimientos y QA | T-01, T-26, T-27 | 5 |

Fuente: Elaboración propia a partir del tablero del equipo (2026).

La cadena crítica es T-09 → T-10 → T-11 y T-12 (sin cuentas no hay acceso) y T-09 → T-15 → T-16 → T-18 (sin perfiles no hay nada que asignar ni clonar). La recertificación (T-27) todavía no está en el tablero del equipo y debe agregarse.

## Cronograma

| Sprint | Fechas | Objetivo | Hito al cierre |
| --- | --- | --- | --- |
| 0 | 04-11-2026 a 17-11-2026 | Diseño de la solución (T-01 a T-07) | **EVA 2:** entrega del informe de diseño y defensa — martes 17-11-2026 |
| 1 | [Confirmar fechas] | H1: acceso y cuentas (T-08 a T-14) | Revisión: solicitar acceso, aprobar e ingresar |
| 2 | [Confirmar fechas] | H2: permisos y perfiles (T-15 a T-20) | Revisión: clonación y concurrencia |
| 3 | [Confirmar fechas] | H3 y H4: vista personal, compatibilidad, registro y rendimiento (T-21 a T-25) | **EVA 3:** MVP construido y probado — [confirmar fecha] |
| 4 | [Confirmar fechas] | Historias *Should Have* (T-26, T-27) | Revisión: aplicaciones, departamentos y recertificación |
| 5 | [Confirmar fechas] | Contraste con la línea base y cierre (T-28) | **EVA 4:** entrega final — [confirmar fecha] |

Fuente: Elaboración propia (2026).

## Definition of Done

Una **tarea** se considera terminada cuando cumple todas las condiciones siguientes:

1. Su *pull request* fue aprobado por un integrante distinto del autor y está fusionado en la rama principal.
2. Los criterios de aceptación de su historia fueron verificados y registrados en el tablero.
3. Sus pruebas automatizadas pasan en el pipeline, y sus casos del plan de pruebas están ejecutados.
4. No incluye credenciales ni secretos en el código o en la configuración versionada.
5. La trazabilidad y la documentación afectadas están actualizadas.

Cada **hito** está terminado cuando su prueba de cierre (tabla de hitos) pasa completa. Además, cada evaluación tiene su condición de término:

| Evaluación | Condición de término |
| --- | --- |
| EVA 2 | Informe con las 12 secciones, cada compromiso respondido o declarado como pendiente, trazabilidad completa y los seis integrantes capaces de defender cualquier sección. |
| EVA 3 | Hitos H1 a H4 terminados, plan de pruebas ejecutado con resultados registrados y P95 medido en el escenario definido. Cualquier recorte se declara por escrito antes de la entrega. |
| EVA 4 | Historias *Should Have* terminadas, mejora contrastada con la línea base y todos los compromisos verificados. |

Fuente: Elaboración propia (2026).

## Riesgos de Plazo

| ID | Riesgo | Mitigación |
| --- | --- | --- |
| R-01 | La línea base completa o la entrevista con RRHH no se consiguen a tiempo. | Declarar lo pendiente y cerrarlo antes de la EVA 4 (T-28). |
| R-02 | El esquema real de la base de datos llega tarde (el docente se comprometió a enviarlo). | Avanzar con la base demo reconstruida y adaptar las pruebas de regresión cuando llegue; recordar la solicitud por escrito. |
| R-03 | El trabajo se concentra al final del sprint o del semestre. | Límite de trabajo en curso en el tablero y revisión de avance a mitad de cada sprint. |
| R-04 | Una tarea de la cadena crítica depende de un solo integrante. | Revisión cruzada obligatoria y trabajo en pares en T-10, T-15 y T-18. |

Fuente: Elaboración propia (2026).
