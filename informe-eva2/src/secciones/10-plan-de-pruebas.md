# Plan de Pruebas

<!-- GUÍA · Sección 11 de la pauta · Criterio 2.1.6 (7 pts).
Cubre: casos con ID, requisito, precondición, pasos/datos y resultado observable; positivos, negativos y de
seguridad; C-02 y C-06; C-03 / CAL-04 con el volumen del cliente (300 usuarios en hora punta, ~600 consumidores).
No incluye resultados: se ejecuta en la EVA 3. -->

Este plan define **qué se va a probar y qué resultado se espera**. Su ejecución y resultados corresponden a la EVA 3. Cada caso tiene identificador, requisito, precondición, datos y pasos, y un **resultado esperado observable**: algo que se comprueba en la pantalla, en la respuesta de la API o en la base de datos, sin interpretación.

## Estrategia de Pruebas

Las pruebas se organizan en cinco niveles, todos en el ambiente local con datos sintéticos (sección 5):

| Nivel | Qué verifica | Herramienta |
| --- | --- | --- |
| Unitarias | Reglas del dominio (permisos efectivos, propagación, clonación, separación de funciones, política de contraseñas) y validadores. | xUnit |
| Integración | *Endpoints* contra SQL Server, Redis y el correo de prueba reales en contenedores: transacciones, auditoría, enlaces e invalidación de caché. | xUnit con Testcontainers |
| Regresión de migración | Que el endpoint entregue los mismos permisos que el modelo legado al momento del corte. | Scripts de comparación |
| Extremo a extremo | Los flujos de la sección 6 en el navegador a 1366 × 768, con dos instancias de la API detrás de un proxy para simular la granja IIS. | Playwright con Microsoft Edge |
| Rendimiento | El escenario de medición del P95 (subsección 10.5). | k6 |

Fuente: Elaboración propia (2026).

**Datos de prueba:** los 50 usuarios, 10 departamentos, 20 perfiles y 37 aplicaciones sintéticos de la EVA 1, más 1.000 colaboradores para la prueba de rendimiento. La API de AD simulada entrega la lista de activos y permite quitar personas o vaciar la lista. Citrix no se puede probar porque el equipo no tiene acceso; se declara como limitación y se compensa probando en Edge con la resolución mínima.

**Criterio de aprobación para la EVA 3:** todos los casos de las historias *Must Have* aprobados, ningún caso de seguridad fallido y el escenario RD-01 dentro de su objetivo. Un caso fallido se registra como incidencia en el tablero con su identificador.

## Casos Funcionales

| ID | Requisito | Precondición | Pasos y datos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CP-01 | RF-15 | `lrojas` está activo en la API de AD y no tiene cuenta. | En el inicio de sesión, elegir «Solicitar acceso» con `lrojas`. | Solicitud `PENDIENTE` visible para los administradores. |
| CP-02 | RF-15 | CP-01; `rsalas` es Administrador TI y no creó la solicitud. | `rsalas` aprueba asignando el perfil «Operador de muelle». | Cuenta `PENDIENTE_ACTIVACION`, perfil asignado, un correo con enlace en el buzón de prueba y evento `ACCESO_APROBADO`. |
| CP-03 | RF-16 | CP-02. | Abrir el enlace y definir una contraseña válida. | Cuenta `ACTIVA`; en la base solo existe un *hash*; `lrojas` puede ingresar. |
| CP-04 | RF-13 | `lrojas` es Colaborador y `rsalas`, Administrador TI. | Ingresar con cada uno. | `lrojas` llega a «Mis permisos» y `rsalas` a la administración. |
| CP-05 | RF-12 | `nuevo01` aparece en la API de AD. | Ejecutar la sincronización. | Colaborador creado, sin cuenta ni permisos; ejecución registrada. |
| CP-06 | RF-12 (CAL-08) | `lrojas` está activo, con permisos. | Quitarlo de la API de AD y esperar la siguiente sincronización. | En 10 minutos o menos: cuenta `DESACTIVADA`, 0 permisos efectivos, el endpoint no devuelve permisos, evento `BAJA_AUTOMATICA` del proceso y la baja aparece en el resumen diario. |
| CP-07 | RF-02 | Colaborador activo; el perfil tiene 2 permisos. | Asignar el perfil. | 2 filas con origen `PERFIL`; el endpoint devuelve los 2 permisos; evento `ASIGNAR_PERFIL`; respuesta en menos de 2 s. |
| CP-08 | RF-03 (C-06) | `mgarcia` tiene el perfil Facturador y una excepción CONSULTA; `lrojas` tiene el perfil Operador. | Clonar el perfil de `mgarcia` a `lrojas`, con ticket y motivo. | `lrojas` queda con el perfil Facturador, **sin** la excepción; evento `CAMBIO_PERFIL` con referencia, destino, perfil anterior y nuevo. |
| CP-09 | RF-03 (C-06) | CP-08. | Cambiar el perfil de `mgarcia` a otro distinto. | `lrojas` conserva Facturador, porque cada uno tiene su propia fila en `usuario.id_perfil`. |
| CP-10 | RF-01 (C-02) | El perfil X lo tienen los colaboradores A, B y C. | Agregar el permiso EMISOR a la plantilla X. | Los 3 obtienen EMISOR de inmediato, en una sola transacción; queda un registro en `perfil_transaccion_cambio` con los 3 afectados en `perfil_transaccion_cambio_usuario`; sus claves de Redis invalidadas. |
| CP-11 | RF-01 (C-02) | El perfil X lo tienen los colaboradores A, B y C; P no está en X. | Agregar el permiso EMISOR, con alcance «solo a A y B». | A y B obtienen EMISOR por una excepción cada uno (`permiso_adiciona`, `asignado = true`); C no cambia; `perfil_sistema_transaccion` de X queda igual que antes. |
| CP-12 | RF-04, RF-11 | `ctorres` y `rsalas` son administradores. | `ctorres` solicita una concesión para `lrojas`; se consulta el endpoint; `rsalas` aprueba; se consulta otra vez. | Antes de aprobar, el permiso no aparece; después aparece con origen `EXCEPCION`. |
| CP-13 | RF-11 | Excepción aprobada con término ayer. | Ejecutar la tarea de vencimiento. | Estado `VENCIDA`; el permiso ya no aparece. |
| CP-14 | RF-09 | Colaborador con perfil X y una excepción vigente que concede el permiso P (P no está en X). | Cambiar su perfil de X a Y (Y sí incluye P); luego darlo de baja con ticket. | Al cambiar de perfil, P se mantiene sin interrupción (lo sigue dando la excepción, luego el perfil nuevo); la excepción queda redundante pero no se borra. Tras la baja: 0 permisos efectivos; perfil y excepción quedan cerrados, no borrados. |
| CP-15 | RF-14 | `lrojas` tiene 1 perfil y 1 excepción. | Ingresar como `lrojas` y abrir «Mis permisos». | Se listan los permisos de su perfil y de su excepción, cada uno con su origen y vencimiento; no hay botones de modificación. |
| CP-16 | RF-08, RNF-05 | Mismos usuarios en el sistema legado y en el modelo nuevo (`perfil_sistema_transaccion` + `permiso_adiciona`). | Ejecutar la misma consulta contra la aplicación VB.NET actual y contra el endpoint REST, con los mismos parámetros. | **Cero diferencias** en los permisos efectivos devueltos por ambos caminos. |
| CP-17 | RF-05 | La clave del usuario no está en Redis. | Consultar dos veces el endpoint. | Respuestas idénticas; la primera es un fallo de caché y la segunda, un acierto. |
| CP-18 | RF-06 | Eventos de varios operadores y fechas. | Filtrar por afectado y rango de fechas. | Solo los eventos que cumplen ambos filtros; detalle con estado anterior y posterior. |
| CP-19 | RF-17 | `lrojas` tiene cuenta activa. | «¿Olvidó su contraseña?» con `lrojas`, usar el enlace y definir una contraseña nueva. | Llega un enlace; la nueva contraseña funciona y la anterior no. |
| CP-20 | RF-18 | Ninguna. | Crear la aplicación «Bodega Demo» y darla de baja. | Aparece en el catálogo y luego queda inactiva, sin borrarse. |
| CP-21 | RF-07 | Ninguna. | Crear el departamento «Logística» y asignarlo a un colaborador. | El colaborador queda con `id_departamento` apuntando a Logística. |
| CP-22 | RF-10 | Campaña abierta para Operaciones. | Confirmar 2 accesos, revocar 1 y cerrar. | El revocado desaparece del endpoint; la campaña cerrada no acepta decisiones. |
| CP-23 | RNF-06 | Edge a 1366 × 768. | Recorrer los flujos de clonación y excepción solo con teclado. | Todo se completa sin desplazamiento horizontal ni mouse. |

Fuente: Elaboración propia (2026).

## Casos Negativos

Verifican que el sistema rechaza lo que debe y que **nada cambia** cuando rechaza:

| ID | Requisito | Precondición | Pasos y datos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CP-24 | RF-03 | Comparación cargada. | Clonar sin ticket. | ERR-03; sin cambios en asignaciones ni eventos. |
| CP-25 | RF-03 | Ninguna. | Elegir el mismo usuario como referencia y destino. | ERR-07; la API rechaza también la llamada directa. |
| CP-26 | RF-15 | `noexiste` no está en la API de AD. | Solicitar acceso con `noexiste`. | ERR-01; no se crea la solicitud. |
| CP-27 | RF-02 | El perfil Z está desactivado. | Asignar Z. | ERR-06; sin asignación. |
| CP-28 | RF-02 (RI-10) | Dos instancias de la API detrás del proxy; ambos administradores leyeron la misma versión de `lrojas`. | Al mismo tiempo, uno otorga y otro quita el permiso P, cada uno en una instancia distinta. | Una operación se aplica y la otra recibe ERR-05 (409); el estado final coincide con la operación aplicada y hay un solo evento. |
| CP-29 | RF-04 | Ninguna. | Solicitar una excepción de 200 días. | ERR-11. |
| CP-30 | RF-04 | Archivo de 6 MB. | Adjuntarlo. | ERR-10; el archivo no se guarda. |
| CP-31 | RF-12 | 100 colaboradores activos. | La API de AD devuelve solo 40 activos. | El freno se activa: nadie se desactiva, se registra la ejecución como frenada y se avisa a TI. |
| CP-32 | RNF-04 (RI-07) | Se simula una falla al insertar el evento de auditoría. | Cambiar el perfil de un colaborador. | La transacción se revierte: `usuario.id_perfil` no cambia y no existe el evento. |
| CP-33 | RNF-10 | Enlace de activación vigente para `jperez`. | Definir como contraseña `jperez2026`, luego `Juan.Perez` y luego `123456789012`. | ERR-16 en los tres casos. |
| CP-50 | RNF-08 (CB-06) | Dos instancias de la API detrás del proxy; un administrador con sesión iniciada. | Detener la instancia que atiende al administrador mientras guarda una clonación; luego repetir la operación. | La sesión sigue válida en la otra instancia; la primera clonación no quedó aplicada a medias y la segunda se aplica completa. |
| CP-51 | RF-15 (CB-07) | El servidor de correo de prueba está detenido. | Aprobar una solicitud de acceso y, luego, iniciar el servidor de correo. | La aprobación queda confirmada; el envío figura como pendiente y el enlace llega después del reintento. |

Fuente: Elaboración propia (2026).

## Casos de Seguridad

| ID | Control | Precondición | Pasos y datos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CP-34 | RI-03 (CAL-07) | `rsalas` creó una solicitud de acceso y una excepción. | `rsalas` intenta aprobar ambas, desde la pantalla y llamando directo a la API. | 403 (ERR-04) en todos los casos; ambas siguen `PENDIENTE`; eventos `ACCESO_DENEGADO`. |
| CP-35 | SEC-02 | Lista de todos los *endpoints*. | Llamar a cada uno sin sesión y con el rol incorrecto. | 401 sin sesión y 403 con rol incorrecto en el 100 % de los *endpoints*. |
| CP-36 | Regla «nunca sobre sí mismo» | `ctorres` es Administrador TI. | `ctorres` se asigna un perfil y se otorga una excepción a sí mismo. | 403; sus permisos no cambian. |
| CP-37 | RNF-11 | `lrojas` es Colaborador con sesión. | Pedir a la API «mis permisos» cambiando el identificador por el de `mgarcia`. | 403 (ERR-09); no se entrega ningún dato de `mgarcia`. |
| CP-38 | RI-06 | Existe el evento 100. | Con la cuenta de la aplicación, ejecutar `UPDATE` y `DELETE` sobre él. | La base rechaza ambas; el evento queda intacto y la verificación del ledger es exitosa. |
| CP-39 | SEC-01 | Ninguna. | Filtrar la bitácora con `' OR 1=1 --`. | Se trata como texto: 0 resultados y ningún error 500. |
| CP-40 | SEC-09 | Ninguna. | Ingresar `<script>alert(1)</script>` como justificación y abrir el detalle. | El texto se muestra literal; no se ejecuta ningún script. |
| CP-41 | Clave de versión (sección 8) | Consultas concurrentes sobre un mismo usuario. | Revocar un permiso mientras se ejecutan 1.000 consultas. | Después de la revocación, ninguna respuesta incluye el permiso. |
| CP-42 | Clave de aplicación satélite | Clave válida de una aplicación. | Usarla contra un *endpoint* de administración; luego consultar con una clave inválida. | 403 y 401, respectivamente. |
| CP-43 | Bloqueo por intentos | Cuenta activa. | Ingresar 5 veces con contraseña errónea y luego con la correcta. | Mismo mensaje en los 5 intentos; 5 eventos `LOGIN_FALLIDO`; con la correcta, ERR-14 hasta que pasen 15 minutos. |
| CP-44 | RNF-12 | Enlace de activación usado y otro vencido. | Abrir cada uno; luego pedir un enlace nuevo y abrir el anterior. | ERR-15 en los dos primeros; el enlace anterior queda invalidado al emitir el nuevo. |
| CP-45 | Revocación de sesiones | `lrojas` con sesión abierta en dos navegadores. | Cambiar la contraseña desde uno de ellos. | La siguiente solicitud del otro navegador es rechazada y pide iniciar sesión. |
| CP-46 | RNF-10, RI-09 | Contraseña conocida `C0ntraseña-Prueba!`. | Buscar ese texto en la base de datos, en la bitácora, en los registros técnicos y en los correos de prueba. | Cero coincidencias; la columna de la cuenta solo contiene un *hash* de Identity. |
| CP-47 | Duración de la sesión | Sesión iniciada. | Dejar el portal 15 minutos sin interacción; en otra sesión, superar las 8 horas. | En ambos casos la sesión termina y se pide iniciar sesión otra vez. |
| CP-48 | SEC-04 | Rama de prueba. | Abrir un *pull request* con una cadena de conexión con contraseña. | El pipeline falla y la fusión queda bloqueada. |
| CP-49 | RNF-12 (no enumeración) | `noexiste` no tiene cuenta. | Pedir la recuperación con `lrojas` y con `noexiste`. | La misma respuesta en pantalla para ambos; solo `lrojas` recibe un correo. |

Fuente: Elaboración propia (2026).

## Escenario de Rendimiento

Esta subsección responde a C-03 y CAL-04 con el volumen que entregó el cliente: en hora punta, **unos 300 usuarios** trabajan a la vez, y como cada uno usa varias aplicaciones, **unos 600 consumidores** consultan la API al mismo tiempo. La transcripción de la entrevista marca como ambigua la cifra de tiempo de respuesta que mencionó el cliente, por lo que se mantiene la meta de RNF-01 (P95 menor a 20 ms), condicionada a confirmar la infraestructura real.

**Condiciones de medición:**

- **Ambiente:** dos instancias de la API detrás de un proxy, SQL Server y Redis en contenedores en un mismo equipo. k6 se ejecuta en el mismo equipo para no medir la red.
- **Datos:** 1.000 colaboradores sintéticos, 37 aplicaciones y un promedio de 8 permisos por colaborador. El tamaño real del documento JSON se mide y se informa.
- **Carga:** escalones de 150, 300 y 600 consumidores concurrentes, cada uno consultando los permisos de un usuario con una pausa aleatoria de 1 a 3 segundos entre consultas, durante 5 minutos por escalón, después de 1 minuto de calentamiento.
- **Patrón:** el 80 % de las consultas se concentra en 300 usuarios, los activos en hora punta.
- **Qué se mide:** latencia P50, P95 y P99; tasa de error; consultas por segundo alcanzadas; tasa de aciertos de caché; y uso de CPU de SQL Server.

| ID | Escenario | Criterio de aceptación |
| --- | --- | --- |
| RD-01 | Caché caliente, Redis disponible, 600 consumidores | P95 menor a 20 ms; aciertos de caché de al menos 95 %; error menor a 0,1 %. |
| RD-02 | Camino sin caché: toda consulta lee la proyección | P95 menor a 100 ms; error menor a 0,1 %. |
| RD-03 | Redis detenido durante la carga | Cero errores; P95 menor a 100 ms (objetivo degradado, sección 5); alerta emitida. |
| RD-04 | Carga de lectura con un cambio de permisos por segundo | Se cumple CP-41 y RD-01 no se degrada más de un 20 %. |

Fuente: Elaboración propia (2026).

El resultado se informará como la carga máxima que cumple cada criterio. Cuando el cliente confirme los servidores reales y la frecuencia con que cada aplicación consulta los permisos, se comparará esa carga máxima con la de producción para concluir si el diseño cumple RNF-01 en las condiciones de MSC Chile.
