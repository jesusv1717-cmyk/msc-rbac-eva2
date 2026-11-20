# Lo que Todos Deben Saber

Cualquier integrante debe poder responder estas preguntas sin mirar el informe. La pauta lo resume así: «qué se va a construir, con qué arquitectura, por qué así, qué datos usa, quién puede hacer qué y cómo sabremos que funciona».

## Las Seis Respuestas Básicas

| Pregunta | Respuesta corta |
| --- | --- |
| ¿Qué se va a construir? | Un portal web donde TI aprueba accesos, asigna perfiles en vez de permisos sueltos, copia el perfil de una persona a otra en una sola pantalla y gestiona excepciones aprobadas por otro administrador. Cada colaborador ve sus permisos, y las 37 aplicaciones siguen funcionando sin cambios. |
| ¿Con qué arquitectura? | Una sola aplicación ordenada por módulos (monolito modular): portal en React, API en .NET 10, SQL Server como fuente de verdad y Redis como caché. Corre en varios servidores IIS con balanceo. |
| ¿Por qué así? | Es lo que un equipo de 6 puede construir y defender en un semestre, y cumple la regla del cliente: «la pregunta y la respuesta siguen siendo las mismas». |
| ¿Qué datos usa? | Colaboradores sincronizados desde AD, cuentas con la clave en *hash*, un perfil vigente por persona, excepciones con vencimiento, una lista de permisos ya calculada y una bitácora que no se puede borrar. |
| ¿Quién puede hacer qué? | Administrador TI gestiona todo; Colaborador solo ve lo suyo. Nadie aprueba lo que creó y nadie se da permisos a sí mismo. |
| ¿Cómo sabremos que funciona? | 51 casos de prueba (funcionales, negativos y de seguridad) y 4 escenarios de carga, hasta 600 consultas simultáneas (unos 300 usuarios en hora punta). Cada requisito tiene al menos una prueba. |

Fuente: Elaboración propia (2026).

## Números que Hay que Recordar

| Dato | Valor | De dónde sale |
| --- | --- | --- |
| Usuarios con acceso | ~1.000, de dos empresas | EVA 1 |
| Aplicaciones que dependen del sistema | 37 (94 %) | EVA 1 |
| Usuarios en hora punta | ~300, unos 600 consumidores simultáneos | Entrevista 14-11 |
| Frecuencia de la sincronización con AD | Cada 10 minutos | Entrevista 14-11 (igual que el sistema actual) |
| Historias / requisitos funcionales | 19 historias; RF-01 a RF-18 | Informe, sección 2 |
| Hitos | 4 (acceso; permisos; vista personal y migración; registro, seguridad y rendimiento) | Informe, sección 3 |
| Pantallas | 8 | Informe, sección 6 |
| Casos de prueba | 51, más 4 escenarios de carga | Informe, sección 10 |
| Casos borde documentados | 15 | Informe, sección 4.5 |
| Meta de latencia | Menos de 20 ms (P95), condicionada a la infraestructura real | RNF-01 |

Fuente: Elaboración propia (2026).

## Lo que Cambió desde la EVA 1 y Por Qué

| Antes | Ahora | Por qué |
| --- | --- | --- |
| Login con Entra ID | Usuario y contraseña propios | El cliente dijo que registrar la aplicación en Entra ID es complejo. |
| Roles sin definir | Administrador TI y Colaborador | Los definió el cliente en la entrevista del 14-11. |
| Sin vista para el colaborador | «Mis permisos» | El cliente lo pidió («suma»). |
| Cambio de perfil sin regla | A todos o solo a algunos | Acordado con el cliente; cierra el compromiso C-02. |
| Conciliación diaria | Cada 10 minutos | Es lo que el cliente ya hace hoy. |
| Infraestructura sin definir | Servidores IIS con balanceo ARR | Lo indicó el cliente. |
| «Cero caídas» | Metas de disponibilidad medibles | Lo pidió la retroalimentación (CAL-05). |

Fuente: Elaboración propia (2026).

## Lo que Está Pendiente y Cómo Decirlo

La pauta acepta pendientes si se declaran con su motivo. Si preguntan, se responde así:

- **Tiempos actuales de alta, cambio y baja (línea base):** «No los obtuvimos en la entrevista. Los pediremos al cliente o los mediremos sobre el sistema legado, y quedan comprometidos para la EVA 4. Lo que sí está confirmado está en el Anexo A».
- **Entrevista con RRHH:** «El profesor nos va a enviar el contacto; quedó declarada como parcial en el compromiso C-04».
- **Migración de las 37 aplicaciones al endpoint:** «Ya no mantenemos los procedimientos legados; cada aplicación pasa a consultar el endpoint, y lo estamos conversando con el cliente aplicación por aplicación (riesgo R-15)».
