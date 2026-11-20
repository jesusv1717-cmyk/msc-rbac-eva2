# Trazabilidad y Riesgos

<!-- GUÍA · Sección 12 de la pauta · Criterio 7 (6 pts, calidad y coherencia).
Cubre: cadena necesidad → historia → RF → interfaz → dato → seguridad → prueba; riesgos técnicos; próximo incremento. -->

## Matriz de Trazabilidad

La matriz recorre la cadena completa que exige la pauta: necesidad → historia → requerimiento → interfaz → dato → seguridad → prueba. Todos los elementos tienen un identificador definido en este informe, por lo que cada fila se puede auditar de forma independiente.

| Necesidad | Historia | Requerimiento | Interfaz | Dato | Seguridad | Prueba |
| --- | --- | --- | --- | --- | --- | --- |
| N-11 | HU13 | RF-13 | Inicio de sesión (Fig. 11) | usuario | Hash, bloqueo por intentos (RNF-10) | CP-04, CP-43, CP-46 |
| N-09 | HU15, HU16 | RF-15 | Inicio de sesión (Fig. 11); solicitudes de acceso (Fig. 13) | solicitud_acceso, usuario | Administrador TI; RI-03 | CP-01, CP-02, CP-26, CP-34 |
| N-11 | HU17, HU18 | RF-16, RF-17 | Inicio de sesión (Fig. 11); Mis permisos (Fig. 12) | link_activacion, usuario | Enlace de un solo uso (RNF-12); sello de seguridad | CP-03, CP-19, CP-33, CP-44, CP-45, CP-49 |
| N-08 | HU12 | RF-12 | Ficha del colaborador (Fig. 14) | usuario, importacion_ad | Proceso de sincronización; freno de seguridad | CP-05, CP-06, CP-31 |
| N-10 | HU14 | RF-14 | Mis permisos (Fig. 12) | permiso_efectivo | Colaborador; solo datos propios (RNF-11) | CP-15, CP-37 |
| N-01 | HU07 | RF-01 | Plantilla de perfil (Fig. 17) | perfil, perfil_sistema_transaccion, perfil_transaccion_cambio, permiso_adiciona | Administrador TI; RI-10 | CP-10, CP-11 |
| N-01 | HU01 | RF-02 | Ficha del colaborador (Fig. 14) | usuario.id_perfil, permiso_efectivo | Nunca sobre sí mismo; RI-10 | CP-07, CP-27, CP-28, CP-36 |
| N-02 | HU02, HU08 | RF-03 | Comparar y clonar (Fig. 10 y 12) | usuario.id_perfil, auditoria | SEC-03 | CP-08, CP-09, CP-24, CP-25 |
| N-05 | HU03 | RF-04 | Excepciones (Fig. 16) | permiso_adiciona (adjunto pendiente, sección 7) | Vencimiento obligatorio (RI-04) | CP-12, CP-29, CP-30, CP-40 |
| N-09 | HU09 | RF-11 | Excepciones (Fig. 16) | permiso_adiciona | Otro administrador aprueba (RI-03) | CP-12, CP-13, CP-34 |
| N-08 | HU10 | RF-09 | Ficha del colaborador (Fig. 14) | usuario | Confirmación explícita | CP-14 |
| N-06 | HU04 | RF-06, RNF-04 | Bitácora (Fig. 18) | auditoria (ledger) | Administrador TI en solo lectura; RI-06, RI-07 | CP-18, CP-32, CP-38, CP-39 |
| N-04 | HU05 | RF-05, RNF-01, RNF-02 | Endpoint REST (sin pantalla) | permiso_efectivo, Redis permisos:usuario:{id_usuario} | Clave de aplicación; ACL de Redis | CP-17, CP-41, CP-42, RD-01 a RD-04 |
| N-07 | — (requisito del cliente) | RF-08, RNF-05 | Endpoint REST (sin pantalla) | permiso_efectivo | Clave de aplicación satélite | CP-16 |
| N-01 | HU19 | RF-18 | Flujo en 6.1 (fuera del MVP) | sistema | Administrador TI | CP-20 |
| N-03 | HU06 | RF-07 | Flujo en 6.1 (fuera del MVP) | departamento | Administrador TI | CP-21 |
| N-08 | HU11 | RF-10 | Flujo en 6.1 (fuera del MVP) | campana_recertificacion, decision_recertificacion (agregadas, sección 7) | Administrador TI | CP-22 |

Fuente: Elaboración propia (2026).

Los requerimientos no funcionales que no pertenecen a una sola historia se trazan así:

| Requerimiento | Dónde se diseña | Cómo se verifica |
| --- | --- | --- |
| RNF-03 (credenciales propias y TLS) | Secciones 4 (D-07) y 9 | CP-43, CP-47 |
| RNF-06 (operación en Citrix) | Sección 6 | CP-23 |
| RNF-07 (mantenibilidad con REPR) | Secciones 4 y 9 (EST-03) | Revisión de código y `dotnet format` |
| RNF-08 (disponibilidad y continuidad) | Sección 5 y casos borde (4.5) | RD-03, CP-50 y despliegue servidor por servidor |
| RNF-09 (gestión de secretos) | Secciones 5 y 9 | CP-48 |
| RNF-10 (protección de contraseñas) | Secciones 7 y 9 | CP-33, CP-46 |
| RNF-11 (solo datos propios) | Sección 9 | CP-37 |
| RNF-12 (enlaces seguros y sin enumeración) | Secciones 7 y 9 | CP-44, CP-49 |
| RNF-13 (registro de la sincronización) | Sección 7 | CP-05, CP-31 |

Fuente: Elaboración propia (2026).

Con las dos tablas se verifica que **todo requerimiento, del RF-01 al RF-18 y del RNF-01 al RNF-13, tiene al menos un caso de prueba**, y que ningún componente, tabla o pantalla queda sin una necesidad que lo justifique.

## Riesgos Técnicos y Mitigación

Los riesgos de plazo (R-01 a R-04) están en la sección 3. Los riesgos técnicos del diseño son los siguientes:

| ID | Riesgo | Impacto | Mitigación |
| --- | --- | --- | --- |
| R-05 | El esquema real que envió el docente difiere de la base demo reconstruida. | Alto (materializado): hubo que reformular el modelo de datos, la regla de propagación y varios casos de prueba. | El modelo se reconstruyó completo sobre el esquema real (sección 7); las pruebas de regresión (CP-16) ahora comparan directamente contra el sistema legado. |
| R-06 | El SQL Server corporativo es anterior a 2022 y no soporta tablas *ledger*. | Medio | Plan B de RI-06: `DENY UPDATE, DELETE` y *trigger*. |
| R-07 | No se conoce con qué frecuencia cada aplicación consulta los permisos, y la cifra de tiempo de respuesta del cliente quedó ambigua. | Medio: el P95 medido podría no representar la operación real. | Medir por escalones hasta 600 consumidores y confirmar ambos datos con el cliente. |
| R-08 | El motor de permisos calcula distinto de como lo hace hoy la aplicación VB.NET; una diferencia no detectada podría dejar permisos excesivos el día del corte. | Medio | La prueba de regresión (CP-16) exige cero diferencias antes de activar el endpoint; la primera campaña de recertificación (HU11) revisa después lo que quedó asignado. |
| R-09 | La API de AD entrega una lista incompleta y la sincronización desactiva a personas por error. | Alto: personas sin acceso en plena faena. | Freno de seguridad del 5 %, aviso a TI y resumen diario de bajas. |
| R-10 | Falla la invalidación de Redis tras un cambio. | Medio | Clave de versión, TTL de 10 minutos y alerta. |
| R-11 | Curva de aprendizaje de FastEndpoints, Identity y Redis. | Medio | Prototipos acotados en el sprint 1 y trabajo en pares. |
| R-12 | Algún satélite autentica a sus usuarios contra `usuario.password_hash`. | Alto: al rehashearla, ese satélite dejaría de funcionar. | Confirmarlo con el cliente antes de modificarla; mientras tanto, no se toca (sección 7, «Brechas Pendientes»). |
| R-13 | Solo hay un Administrador TI disponible y nadie puede aprobar lo que él crea. | Medio: solicitudes y excepciones detenidas. | Designar al menos un segundo administrador, por ejemplo la jefatura de TI, como condición de puesta en marcha. |
| R-14 | Alguien con acceso al buzón de un colaborador usa su enlace de activación. | Medio | Enlaces de un solo uso y 15 minutos de vigencia; el acceso es solo desde equipos corporativos (riesgo residual declarado). |
| R-15 | Alguna de las 37 aplicaciones satélites no logra migrar a tiempo al endpoint, y ya no existe una vía de respaldo (procedimientos fachada). | Alto: esa aplicación podría quedar sin permisos. | Acordar con el cliente un cronograma de migración aplicación por aplicación (Anexo B), antes de retirar los procedimientos y vistas legados de cada satélite. |

Fuente: Elaboración propia (2026).

## Próximo Incremento

El próximo incremento es el **sprint 1, hito H1: acceso y cuentas** (tareas T-08 a T-14). Se eligió primero porque todas las demás funciones necesitan que existan cuentas, sesiones y colaboradores sincronizados:

1. Repositorio con la estructura de la vista de desarrollo, el pipeline con escáner de secretos y revisión obligatoria, y el ambiente local con SQL Server, Redis, correo de prueba y la API de AD simulada.
2. Esquema relacional, bitácora *append-only* y datos sintéticos.
3. Inicio de sesión con credenciales propias, bloqueo por intentos y sesión válida en dos instancias de la API.
4. Solicitud y aprobación de acceso, enlaces de un solo uso y sincronización cada 10 minutos con su freno.

Al cierre del sprint, la demostración al *Product Owner* será la prueba del hito H1: solicitar acceso, aprobarlo con otro administrador, definir la contraseña con el enlace, ingresar, comprobar que un enlace vencido no sirve, y simular la salida de una persona del directorio. Con esa base, los sprints 2 y 3 completan el MVP para la EVA 3.
