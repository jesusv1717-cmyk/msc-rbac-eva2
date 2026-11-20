# Arquitectura de la Solución (Modelo 4+1)

<!-- GUÍA · Sección 5 de la pauta · Criterio 2.1.2 (15 pts, junto con infraestructura).
Cubre: cuatro vistas + escenarios enfocados en casos borde (indicación del docente); responsabilidad de cada
componente; alternativas descartadas; C-05 (camino de consulta y Redis caído); concurrencia entre servidores IIS. -->

La arquitectura se describe con el modelo de vistas 4+1 de Kruchten (1995): cuatro vistas complementarias (lógica, de desarrollo, de procesos y física) y un conjunto de escenarios que las recorren para demostrar que funcionan juntas. Por indicación del docente, los escenarios se enfocan en los **casos borde**: lo que ocurre cuando algo falla o cuando dos cosas pasan al mismo tiempo.

El estilo general es un **monolito modular**: una sola API desplegable, dividida internamente en módulos por capacidad de negocio, más una SPA y la base de datos existente. Este tamaño es deliberado, porque responde al problema con el menor número de piezas que un equipo de seis personas puede construir, probar y defender en un semestre (decisión D-01).

## Vista Lógica

La vista lógica muestra qué hace el sistema y qué responsabilidad tiene cada componente, sin entrar en tecnologías ni en despliegue.

![Vista lógica con presentación, aplicación, datos y sistemas externos](assets/diagramas/01-vista-logica.svg "Figura 1. Vista lógica de la solución. Fuente: Elaboración propia (2026)."){.img-h10}

| Componente | Responsabilidad | Necesidad |
| --- | --- | --- |
| Portal web (SPA) | Presentar las pantallas de administración y la vista personal. No contiene reglas de negocio ni decide permisos. | N-01, N-02, N-05, N-10 |
| Autenticación propia y autorización | Verificar usuario y contraseña, mantener la sesión y validar el rol en cada solicitud. Es la única puerta de entrada a la API. | N-09, N-11 |
| Módulos de negocio | Ejecutar los casos de uso: acceso y cuentas, catálogo, asignaciones, clonación, excepciones y bajas. Cada operación valida sus datos. | N-01, N-02, N-05, N-08 |
| Motor de permisos efectivos | Calcular, en C#, los permisos efectivos de un colaborador (perfil más excepciones vigentes) y guardar el resultado en una proyección. | N-04 (RNF-02) |
| Registro de auditoría | Escribir un evento inmutable por cada cambio, en la misma transacción que el cambio. | N-06 |
| Sincronización con AD | Cada 10 minutos, comparar la lista de activos del directorio con las identidades registradas, crear las nuevas y desactivar las que faltan, con un freno ante listas anómalas. | N-08 |
| Consulta para satélites | Responder los permisos efectivos de un usuario, primero desde Redis y, si falla, desde la proyección. | N-04, N-07 |
| SQL Server | Fuente de verdad: modelo RBAC, cuentas, proyección y bitácora. | N-06, N-07 |
| Redis | Caché de los permisos efectivos. No es fuente de verdad: si se pierde, se reconstruye. | N-04 (RNF-01) |

Fuente: Elaboración propia (2026).

La decisión central de esta vista es la **proyección de permisos efectivos**, calculada sobre `perfil_sistema_transaccion` y `permiso_adiciona` (sección 7). El esquema de origen no trae esta tabla: hoy la aplicación VB.NET resuelve los permisos en cada consulta, lo que sobrecarga SQL Server (causa 4). En el diseño, el cálculo ocurre en C# solo cuando algo cambia, y el resultado queda guardado. Cada consulta al endpoint se convierte en una lectura por índice. Así se cumple el requisito del cliente de que **la pregunta y la respuesta sigan siendo las mismas**, pero sobre una base más robusta.

## Vista de Desarrollo

La vista de desarrollo muestra cómo se organiza el código y qué depende de qué. Es la estructura del repositorio que el equipo usará desde el sprint 1.

![Vista de desarrollo con proyectos del repositorio y sus dependencias](assets/diagramas/02-vista-desarrollo.svg "Figura 2. Vista de desarrollo: proyectos del repositorio y dependencias. Fuente: Elaboración propia (2026).")

- **`Msc.Rbac.Domain`** no depende de ningún otro proyecto. Contiene las reglas del informe (permisos efectivos, propagación, clonación y separación de funciones), por lo que se prueba sin base de datos.
- **`Msc.Rbac.Api`** organiza cada operación como una carpeta con su *endpoint*, su DTO de entrada, su DTO de salida y su validador (patrón REPR de FastEndpoints, RNF-07).
- **`Msc.Rbac.Infrastructure`** concentra todo lo externo: EF Core para SQL Server con consultas parametrizadas, ASP.NET Core Identity para credenciales, cliente de Redis, cliente de la API de AD y envío de correo.
- **`database/`** versiona las migraciones y los permisos de base de datos de la bitácora.
- **`web/`** contiene la SPA organizada por funcionalidad y consume la API desde el contrato OpenAPI.
- **`tests/`** reúne las pruebas unitarias, de integración con contenedores reales, de regresión, extremo a extremo y de carga.

## Vista de Procesos

La vista de procesos muestra qué se ejecuta en paralelo y cómo se comportan los flujos críticos en tiempo de ejecución. En producción, la API corre en **varios servidores IIS a la vez** detrás de un balanceador ARR (sección 5), y cada servidor atiende tanto al portal como a las consultas de los satélites. Además, se ejecutan tres tareas en segundo plano:

- **Sincronización con AD (cada 10 minutos):** replica el proceso que el cliente ya usa. Si una persona es desvinculada, su cuenta queda desactivada y sin permisos efectivos antes de que pueda volver a su computador (HU12).
- **Vencimiento de excepciones (cada hora):** revoca las excepciones cuya fecha de término pasó.
- **Envío de correos:** los enlaces de un solo uso se envían con reintentos si el servidor de correo no responde.

Para que dos servidores no ejecuten la misma tarea a la vez, cada ejecución toma un bloqueo de aplicación en SQL Server (`sp_getapplock`) antes de comenzar. La Figura 3 resume los procesos que corren en paralelo y cómo se coordinan.

![Diagrama de los procesos concurrentes: solicitudes en la granja IIS, tareas en segundo plano y coordinación en SQL Server](assets/diagramas/11-vista-procesos.svg "Figura 3. Vista de procesos: solicitudes, tareas en segundo plano y coordinación en SQL Server. Fuente: Elaboración propia (2026).")

**Camino de consulta de permisos (C-05).** La Figura 4 responde al compromiso C-05:

- **Qué se cachea:** solo la lista final de permisos efectivos de cada usuario, bajo la clave `permisos:usuario:{id}`. Su estructura se detalla en la sección 8.
- **Cuánto dura:** cada clave tiene un tiempo de vida (TTL) de 10 minutos. Es un límite de seguridad por si una invalidación falla, no el mecanismo principal.
- **Cuándo se invalida:** inmediatamente después de confirmar cualquier transacción que cambie los permisos de un usuario.
- **Si Redis no responde:** la API espera como máximo 50 ms, lee la proyección directamente desde SQL Server, responde igual y emite una alerta.

![Diagrama de secuencia de la consulta de permisos efectivos con acierto, fallo de caché y Redis caído](assets/diagramas/03-secuencia-consulta-satelite.svg "Figura 4. Secuencia de la consulta de permisos efectivos desde una aplicación satélite. Fuente: Elaboración propia (2026).")

**Camino de modificación.** La Figura 5 muestra la clonación, representativa de toda operación que cambia permisos. Los cambios, el recálculo de la proyección y el evento de auditoría se confirman en **una sola transacción**: si cualquiera falla, no se aplica ninguno. La invalidación de Redis ocurre después del *commit*; si falla, el TTL corrige la caché en un máximo de 10 minutos.

![Diagrama de secuencia de la clonación de permisos](assets/diagramas/04-secuencia-clonacion.svg "Figura 5. Secuencia de la clonación con bloqueo de fila, transacción única y auditoría. Fuente: Elaboración propia (2026).")

**Concurrencia entre servidores.** El docente advirtió que el balanceo de carga reparte las solicitudes sin coordinar a los servidores: si dos administradores otorgan y quitan el mismo permiso al mismo tiempo, cada uno puede caer en un servidor distinto. El diseño lo resuelve en la base de datos, que es el único punto común:

1. Toda operación que modifica a un colaborador o a un perfil comienza su transacción **bloqueando esa fila** (`UPDLOCK, ROWLOCK`). La segunda operación espera a que la primera haga *commit* y libere la fila.
2. Cuando la segunda operación obtiene la fila, **verifica que la versión (`rowversion`) sea la misma que leyó la pantalla**. Si cambió, se cancela y se pide recargar, porque el administrador decidió sobre datos que ya no son actuales.
3. El bloqueo dura solo lo que dura la transacción, y nunca se mantiene mientras alguien tiene una pantalla abierta. Esto evita repetir el problema del legado, donde los registros quedaban bloqueados si se cerraba la aplicación. Para que nadie trabaje sin saberlo, la pantalla de un perfil avisa si otro administrador lo está editando, pero no lo bloquea.

![Diagrama de secuencia de dos administradores modificando el mismo usuario desde servidores distintos](assets/diagramas/09-secuencia-concurrencia.svg "Figura 6. Dos administradores modifican el mismo usuario desde servidores IIS distintos. Fuente: Elaboración propia (2026)."){.img-h12}

**Desvinculación de un trabajador.** La Figura 7 muestra la tarea de sincronización con AD (E-04): toma el bloqueo de aplicación, compara la lista de activos, desactiva a quien falta y registra el evento en la misma transacción. Si la lista llega vacía o con más de un 5 % menos de activos, el freno impide cualquier baja y avisa a TI.

![Diagrama de secuencia de la sincronización con AD y la baja automática, con el freno de seguridad](assets/diagramas/12-secuencia-desvinculacion.svg "Figura 7. Secuencia de la sincronización con AD: baja automática y freno de seguridad. Fuente: Elaboración propia (2026)."){.img-h12}

## Vista Física

La vista física muestra en qué infraestructura se ejecuta cada componente. Corresponde a la arquitectura que indicó el cliente: servidores IIS balanceados con ARR. La justificación de cada elemento está en la sección 5.

Tres decisiones de esta vista (Figura 8) son relevantes:

- **La sesión sirve en cualquier servidor.** Las claves que cifran la cookie de sesión se guardan en SQL Server y las comparten todos los servidores IIS. Así, ARR puede enviar cada solicitud a cualquier servidor, sin sesiones fijas (D-11).
- **La API sirve también la SPA.** El despliegue es una sola pieza versionada por servidor.
- **El esquema nuevo vive en la misma base de datos que usan los satélites,** porque el motor de permisos lee y escribe sobre el mismo esquema legado mientras dura la migración hacia el endpoint.

![Vista física con Citrix, balanceador ARR, servidores IIS, SQL Server, Redis, correo y AD](assets/diagramas/05-vista-fisica.svg "Figura 8. Vista física del despliegue objetivo. Fuente: Elaboración propia (2026)."){.img-h10}

## Escenarios de Validación (+1)

Cada escenario recorre las cuatro vistas. El primero valida el flujo de la necesidad principal; los otros tres son los casos borde de mayor impacto: la falla de un componente, la concurrencia entre servidores y la salida de una persona de la empresa. La Figura 9 relaciona cada escenario con su actor y con la vista de procesos que lo demuestra.

![Escenarios de validación con sus actores y la vista de procesos que demuestra cada uno](assets/diagramas/13-escenarios-mas-uno.svg "Figura 9. Escenarios de validación (+1): actores y secuencias que los demuestran. Fuente: Elaboración propia (2026).")

| Escenario | Vista lógica | Vista de desarrollo | Vista de procesos | Vista física |
| --- | --- | --- | --- | --- |
| **E-01. Clonación de permisos** (HU02, HU08): el administrador compara a un usuario de referencia con uno nuevo y clona. | SPA → autorización → clonación → motor → auditoría → SQL Server; invalidación en Redis. | Funcionalidad de clonación en la SPA y en la API; reglas en el proyecto de dominio. | Bloqueo de fila, una transacción y luego invalidación (Figura 5). | Edge en Citrix → ARR → cualquier servidor IIS → SQL Server y Redis. |
| **E-02. Consulta con Redis caído** (HU05): un satélite pide permisos mientras Redis no responde. | Consulta → (Redis no responde) → proyección. | Funcionalidad de permisos efectivos; cliente de Redis en infraestructura. | Espera máxima de 50 ms, lectura de la proyección y alerta (Figura 4). | Satélite → ARR → servidor IIS → SQL Server. |
| **E-03. Dos administradores sobre el mismo usuario** (HU01, HU10): uno otorga y otro quita el mismo permiso al mismo tiempo. | Ambas operaciones pasan por autorización y módulos de negocio. | Mismo *endpoint*; el control está en la capa de datos. | Bloqueo de fila; la segunda operación detecta el cambio de versión y se rechaza (Figura 6). | ARR envía cada solicitud a un servidor distinto; ambos apuntan a la misma base. |
| **E-04. Desvinculación de un trabajador** (HU12): RRHH desvincula a una persona y AD deja de incluirla. | Sincronización → motor (permisos vacíos) → auditoría como proceso. | Tarea programada en la API; cliente de AD en infraestructura. | En la siguiente ejecución (máximo 10 minutos) la cuenta se desactiva; si la lista llega incompleta, el freno impide bajas masivas (Figura 7). | Un solo servidor IIS ejecuta la tarea gracias al bloqueo de aplicación. |

Fuente: Elaboración propia (2026).

Las figuras 10 a 13 muestran, para cada escenario, qué componentes participan y en qué orden:

![Flujo por componentes del escenario E-01: clonación de permisos](assets/diagramas/14-escenario-clonacion.svg "Figura 10. E-01 Clonación de permisos: flujo por componentes. Fuente: Elaboración propia (2026).")

![Flujo por componentes del escenario E-02: consulta con Redis caído](assets/diagramas/15-escenario-redis-caido.svg "Figura 11. E-02 Consulta con Redis caído: flujo por componentes. Fuente: Elaboración propia (2026).")

![Flujo por componentes del escenario E-03: dos administradores sobre el mismo usuario](assets/diagramas/16-escenario-dos-administradores.svg "Figura 12. E-03 Dos administradores sobre el mismo usuario: flujo por componentes. Fuente: Elaboración propia (2026).")

![Flujo por componentes del escenario E-04: desvinculación de un trabajador](assets/diagramas/17-escenario-desvinculacion.svg "Figura 13. E-04 Desvinculación de un trabajador: flujo por componentes. Fuente: Elaboración propia (2026).")

### Catálogo de casos borde

Además de los cuatro escenarios, el diseño define cómo se comporta en los siguientes casos borde. Cada uno indica qué parte de la arquitectura lo resuelve y qué prueba de la sección 10 lo verifica:

| ID | Caso borde | Comportamiento esperado | Lo resuelve | Prueba |
| --- | --- | --- | --- | --- |
| CB-01 | Se abre un enlace de activación ya usado o vencido. | Se rechaza (ERR-15). Si el acceso ya estaba aprobado, se ofrece reenviar el enlace sin una nueva aprobación. | Tabla de enlaces con vencimiento y marca de uso (sección 7). | CP-44 |
| CB-02 | Un administrador intenta aprobar una solicitud de acceso o una excepción que él mismo creó. | Se rechaza con 403, la solicitud sigue pendiente y el intento queda registrado. | Autorización en la API y restricción RI-03 en la base. | CP-34 |
| CB-03 | Un administrador intenta asignarse perfiles o excepciones a sí mismo. | Se rechaza con 403; sus permisos no cambian. | Regla «nunca sobre sí mismo» en el dominio. | CP-36 |
| CB-04 | Un colaborador intenta ver los permisos de otra persona cambiando el identificador en la solicitud. | Se rechaza con 403 sin entregar datos ajenos. | La API toma la identidad de la sesión, no de la solicitud (RNF-11). | CP-37 |
| CB-05 | Alguien prueba contraseñas repetidamente sobre una cuenta. | Tras 5 intentos la cuenta se bloquea 15 minutos; el mensaje es siempre el mismo. | ASP.NET Core Identity y registro de intentos fallidos. | CP-43 |
| CB-06 | Se cae un servidor IIS mientras hay usuarios trabajando. | ARR envía las solicitudes al otro servidor y la sesión sigue válida. Una operación que estaba en curso se revierte completa y el usuario puede repetirla. | Claves de sesión compartidas (D-11) y transacción única. | CP-50 |
| CB-07 | El servidor de correo no responde al aprobar un acceso. | La aprobación se confirma igual; el envío del enlace queda pendiente con reintentos y el administrador puede reenviarlo. | Envío de correos en segundo plano (vista de procesos). | CP-51 |
| CB-08 | Un colaborador es desactivado (por AD o por TI) mientras tiene una sesión abierta. | Su siguiente solicitud es rechazada y pide iniciar sesión; los satélites dejan de recibir sus permisos. | Sello de seguridad de la cuenta y proyección vacía. | CP-06, CP-45 |
| CB-09 | La API de AD entrega una lista vacía o con muchas menos personas que la vez anterior. | No se desactiva a nadie; la ejecución queda registrada como frenada y se avisa a TI. | Freno de seguridad de la sincronización (sección 7). | CP-31 |
| CB-10 | Dos administradores editan la misma plantilla de perfil a la vez. | La pantalla avisa que el perfil está en edición; el segundo guardado se rechaza (409) y debe recargar los datos vigentes. | Bloqueo de fila y verificación de `rowversion` en `perfil` (RI-10). | CP-28 |
| CB-11 | Se revoca un permiso justo cuando muchas consultas están llenando la caché. | Ninguna respuesta posterior incluye el permiso revocado. | Clave de versión en Redis (sección 8). | CP-41 |
| CB-12 | Falla una parte de una operación, por ejemplo la escritura de la auditoría. | Se revierte todo: no queda un cambio de permisos sin su registro. | Transacción única (RI-07). | CP-32 |
| CB-13 | Una excepción vence fuera del horario laboral. | La tarea horaria la revoca y el permiso deja de entregarse a los satélites. | Tarea de vencimiento en segundo plano. | CP-13 |
| CB-14 | Un colaborador cambia de perfil mientras tiene una excepción vigente de un permiso que el perfil nuevo también otorga. | El permiso se mantiene sin interrupción durante el cambio; la excepción queda redundante pero visible, no se borra sola. | `usuario.id_perfil` se actualiza en la misma transacción que recalcula la proyección. | CP-14 |
| CB-15 | El día del cambio desde la aplicación VB.NET actual. | Los satélites reciben exactamente los mismos permisos que antes del cambio. | Regresión contra el sistema legado (CP-16) y el endpoint REST. | CP-16 |

Fuente: Elaboración propia (2026).

## Decisiones y Alternativas Descartadas

| ID | Decisión | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| D-01 | Monolito modular: una API con módulos internos. | Microservicios por módulo. | Seis personas y un semestre no justifican desplegar y monitorear varios servicios. |
| D-02 | SPA en React con TypeScript. | Blazor Server y Blazor WebAssembly. | Blazor Server mantiene una conexión persistente por usuario, sensible a reconexiones de Citrix; WebAssembly descarga el runtime al navegador (RNF-06). La exigencia corporativa de C# y .NET se cumple en el backend. |
| D-03 | FastEndpoints (patrón REPR). | Controladores MVC; Minimal APIs; Fastify en Node.js. | Los controladores crecen sin control; las Minimal APIs no imponen estructura; Fastify obliga a un segundo runtime. |
| D-04 | Permisos calculados en C# y guardados en una proyección. | Seguir calculando en vistas y procedimientos en cada consulta. | Es la causa 4 del diagnóstico (RNF-02). |
| D-05 | Caché compartida en Redis, con invalidación explícita y TTL. | Caché en la memoria de cada servidor IIS. | Con varios servidores, una caché local quedaría desactualizada en los que no procesaron el cambio. |
| D-06 | Eliminar los procedimientos y vistas legados; las aplicaciones satélites consumen el endpoint REST. | Mantener una capa de coexistencia con procedimientos fachada. | El cliente confirmó que puede exponerse un endpoint para que las satélites lo consuman directamente; la coexistencia agregaba complejidad sin aportar sobre N-07. |
| D-07 | Credenciales propias con ASP.NET Core Identity. | Inicio de sesión con Entra ID; autenticación de Windows; implementar el *hash* y el bloqueo a mano. | El cliente descartó registrar la aplicación en Entra ID. La autenticación de Windows no aplica a los colaboradores que solo consultan. Implementar criptografía propia es un riesgo: Identity ya resuelve el *hash*, el bloqueo y los enlaces de un solo uso. |
| D-08 | El endpoint REST es el canal único de consumo para las 37 aplicaciones satélites. | Mantener los procedimientos fachada como vía alternativa (adopción opcional). | El cliente confirmó que la migración del código de los satélites puede conversarse (Anexo B); mantener dos vías duplicaba el trabajo sin necesidad. |
| D-09 | Bloqueo de fila dentro de la transacción. | Cola FIFO en Redis que ordene todas las modificaciones. | El docente propuso ambas. La cola es más elegante, pero agrega un componente y un punto de falla. Con un operador habitual y un servidor de base de datos holgado, el bloqueo de fila resuelve el caso borde con menos piezas. |
| D-10 | La persona define su contraseña con un enlace de un solo uso. | Generar una contraseña inicial y enviarla por correo. | Con el enlace, ninguna contraseña real viaja por correo ni la conoce TI. |
| D-11 | Claves de sesión compartidas entre servidores, guardadas en SQL Server. | Sesiones fijas (*sticky sessions*) en ARR. | Con sesiones fijas, si un servidor cae, sus usuarios pierden la sesión, y la carga no se reparte de forma pareja. |

Fuente: Elaboración propia (2026).
