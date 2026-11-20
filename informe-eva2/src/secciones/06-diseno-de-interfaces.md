# Diseño de Interfaces

<!-- GUÍA · Sección 7 de la pauta · Criterio 2.1.3 (10 pts).
Cubre: flujo entrada → acción → validación → resultado → error por tarea; wireframes con información, acciones,
validaciones y errores; cada pantalla con su RF. Wireframes en src/wireframes/*.html (`pnpm wireframes`). -->

Las interfaces se diseñan a partir de las tareas reales de cada usuario, no de las tablas de la base de datos. Hay dos experiencias según el rol con que se inicia sesión: el **Administrador TI** entra al portal de administración y el **Colaborador** entra directamente a su vista personal. Es el mismo inicio de sesión, que dirige a cada página según el rol, tal como lo describió el cliente. Los wireframes son de baja fidelidad (escala de grises): definen qué información se ve, qué acciones existen y cómo se informan los errores.

Por ejecutarse en Microsoft Edge dentro de Citrix (RNF-06), todas las pantallas siguen estos criterios:

- Resolución mínima de 1366 × 768, sin animaciones.
- Tablas paginadas en el servidor, de 50 filas por página.
- Navegación completa con teclado y etiquetas siempre visibles.
- Confirmación explícita antes de cualquier acción que quite permisos.

Ocultar un botón según el rol es solo una ayuda visual: **toda acción se vuelve a autorizar en la API** (sección 9).

## Flujos por Tarea del Usuario

La siguiente tabla define, para cada tarea, el flujo entrada → acción → validación → resultado → error. Los códigos de error se detallan en la subsección 6.3.

| Tarea (historia · RF) | Entrada | Acción | Validación | Resultado | Error |
| --- | --- | --- | --- | --- | --- |
| Iniciar sesión (HU13 · RF-13) | Usuario y contraseña | Ingresar | Credenciales válidas; cuenta activa y no bloqueada | Entra a la administración o a «Mis permisos» según el rol | ERR-13, ERR-14 |
| Solicitar acceso (HU15 · RF-15) | Usuario corporativo | Solicitar acceso | La identidad existe y está activa en el directorio; no tiene otra solicitud pendiente | Solicitud `PENDIENTE` para los administradores | ERR-01 |
| Aprobar acceso (HU16 · RF-15) | Solicitud, perfil inicial y ticket | Aprobar y enviar enlace | El aprobador no creó la solicitud; perfil vigente | Cuenta creada, perfil asignado y enlace enviado | ERR-04, ERR-06 |
| Definir o cambiar contraseña (HU17 · RF-16) | Enlace del correo y nueva contraseña | Guardar | Enlace vigente y no usado; contraseña conforme a la política | Contraseña guardada como *hash*; enlaces anteriores y sesiones invalidados | ERR-15, ERR-16 |
| Recuperar contraseña (HU18 · RF-17) | Usuario o correo | Enviar enlace | Ninguna visible: la respuesta es la misma exista o no la cuenta | Si la cuenta existe, se envía un enlace | — |
| Ver mis permisos (HU14 · RF-14) | Sesión de colaborador | Abrir la vista | Solo se consultan los datos propios | Lista de aplicaciones, permisos y su origen | ERR-09 |
| Asignar o cambiar perfil (HU01 · RF-02) | Colaborador y perfil | Asignar | Perfil vigente; colaborador activo; no es el propio administrador | Permisos recalculados y evento registrado | ERR-02, ERR-06, ERR-09 |
| Comparar y clonar (HU02, HU08 · RF-03) | Referencia, destino, ticket y motivo | Clonar | Usuarios distintos y activos; ticket y motivo | Perfil copiado y evento `CAMBIO_PERFIL` | ERR-02, ERR-03, ERR-05, ERR-07 |
| Solicitar una excepción (HU03 · RF-04) | Colaborador, permiso, tipo, vigencia, ticket, justificación y adjunto | Enviar a aprobación | Vigencia válida; sin conflicto con otra excepción; adjunto permitido | Excepción `PENDIENTE`, todavía sin efecto | ERR-03, ERR-10, ERR-11 |
| Aprobar una excepción (HU09 · RF-11) | Solicitud pendiente | Aprobar o rechazar | El aprobador no es el solicitante; motivo si rechaza | Excepción aplicada o rechazada | ERR-04 |
| Dar de baja (HU10 · RF-09) | Colaborador, ticket y motivo | Confirmar baja | Ticket y motivo; confirmación explícita | Cuenta desactivada y permisos efectivos vacíos | ERR-03, ERR-05 |
| Modificar plantilla de perfil (HU07 · RF-01) | Permisos a agregar o quitar, alcance (todos o colaboradores seleccionados), ticket y justificación | Aplicar | `rowversion` del perfil sin cambios desde la lectura; al menos un colaborador si el alcance es «algunos» | «Todos»: cambia la plantilla, con registro de cada afectado. «Algunos»: crea una excepción por cada colaborador elegido, sin tocar la plantilla. Ambas en una transacción | ERR-03, ERR-05 |
| Consultar la bitácora (HU04 · RF-06) | Fechas, afectado, operador y aplicación | Filtrar y ver detalle | Rango de fechas válido | Lista paginada y detalle de solo lectura | ERR-08 |
| Mantener aplicaciones (HU19 · RF-18) | Nombre, sigla y estado | Crear, editar o dar de baja | Sigla única; no se da de baja si tiene permisos vigentes | Catálogo actualizado | ERR-06 |
| Mantener departamentos (HU06 · RF-07) | Nombre | Crear, editar o desactivar | Nombre único; sin usuarios activos asignados para desactivar | Catálogo actualizado | ERR-06 |
| Recertificar accesos (HU11 · RF-10) | Campaña abierta | Confirmar o revocar | Campaña abierta; todos los accesos resueltos antes de cerrar | Revocaciones aplicadas y evidencia | ERR-05 |

Fuente: Elaboración propia (2026).

La clonación es la tarea más importante para TI, porque elimina la «doble ventana» (N-02). La Figura 14 detalla su flujo con los puntos de validación y los caminos de error:

![Diagrama de flujo de la clonación con validaciones y errores](assets/diagramas/08-flujo-clonacion.png "Figura 14. Flujo de la tarea de comparación y clonación. Fuente: Elaboración propia (2026)."){.img-h14}

## Wireframes

Se presentan ocho pantallas: tres de acceso y vista personal, y cinco de administración. Los números en círculos negros señalan los puntos de validación o de error que se explican bajo cada figura. Las pantallas de aplicaciones, departamentos y recertificación, que quedan fuera del MVP, reutilizan los mismos componentes: formulario de mantenimiento y tabla de decisiones.

**Inicio de sesión y definición de contraseña (HU13, HU15, HU17 · RF-13, RF-15, RF-16).** Es la entrada única al portal.

![Wireframe de inicio de sesión y definición de contraseña](assets/wireframes/w00-login.png "Figura 15. Wireframe de inicio de sesión, solicitud de acceso y definición de contraseña. Fuente: Elaboración propia (2026).")

① El mensaje de error no indica si falló el usuario o la contraseña, y la cuenta se bloquea tras 5 intentos. ② Quien aún no tiene cuenta puede solicitarla, siempre que su identidad exista en el directorio. ③ La contraseña se define desde el enlace del correo; si el enlace venció o ya se usó, se puede pedir uno nuevo sin una nueva aprobación.

**Mis permisos (HU14 · RF-14).** Es la vista que pidió el cliente: cada colaborador ve sus aplicaciones y permisos.

![Wireframe de la vista personal de permisos](assets/wireframes/w06-mis-permisos.png "Figura 16. Wireframe de la vista «Mis permisos» del colaborador. Fuente: Elaboración propia (2026).")

① Cada permiso muestra su origen: un perfil o una excepción con su ticket y vencimiento. ② La pantalla es solo de lectura, y la API rechaza cualquier consulta a datos de otra persona. ③ El cambio de contraseña usa el mismo mecanismo de enlace: la pantalla nunca pide ni muestra contraseñas.

**Solicitudes de acceso (HU16 · RF-15).** Concentra en un paso la aprobación, la asignación del perfil inicial y el envío del enlace.

![Wireframe de solicitudes de acceso pendientes](assets/wireframes/w07-solicitudes-acceso.png "Figura 17. Wireframe de aprobación de solicitudes de acceso. Fuente: Elaboración propia (2026).")

① Al aprobar se elige el perfil inicial y se exige un ticket. ② La pantalla explica qué ocurrirá, incluido que TI nunca conocerá la contraseña. ③ Quien creó una solicitud no puede aprobarla.

**Ficha del colaborador (HU01, HU10 · RF-02, RF-09).** Es la pantalla de trabajo diario de TI. Los colaboradores llegan solos desde el directorio, por lo que aquí no hay una acción de alta.

![Wireframe de la ficha del colaborador](assets/wireframes/w01-colaborador.png "Figura 18. Wireframe de la ficha del colaborador. Fuente: Elaboración propia (2026).")

① Muestra por separado el estado de la identidad en el directorio y el de la cuenta en el portal. ② Asignar o cambiar un perfil recalcula los permisos efectivos. ③ La baja muestra antes de confirmar exactamente qué se revocará, y exige ticket y motivo.

**Comparar y clonar (HU02, HU08 · RF-03).** Reemplaza la doble ventana por una sola vista. La acción opera sobre el **perfil**, según la definición de clonación de la sección 7.

![Wireframe de la pantalla de comparación y clonación](assets/wireframes/w02-clonacion.png "Figura 19. Wireframe de comparación y clonación. Fuente: Elaboración propia (2026).")

① Referencia y destino deben ser colaboradores activos y distintos. ② Las excepciones de la referencia no se copian; la pantalla ofrece solicitarlas como excepciones nuevas. ③ Ticket y motivo son obligatorios.

**Excepciones y aprobación (HU03, HU09 · RF-04, RF-11).** Separa la solicitud de la aprobación entre dos administradores distintos.

![Wireframe de la pantalla de excepciones y aprobación](assets/wireframes/w03-excepciones.png "Figura 20. Wireframe de solicitud y aprobación de excepciones. Fuente: Elaboración propia (2026).")

① La solicitud exige tipo, vigencia con fecha de término, ticket y justificación; el adjunto no puede superar 5 MB. ② El aprobador ve el detalle completo antes de decidir. ③ Intentar aprobar una solicitud propia muestra el error de separación de funciones.

**Plantilla de perfil (HU07 · RF-01).** El esquema de origen no versiona los perfiles, pero el administrador conserva la elección que pidió el cliente: aplicar el cambio a todos los colaboradores del perfil o solo a los que seleccione (sección 7).

![Wireframe de la plantilla de perfil con selección de colaboradores](assets/wireframes/w04-plantilla-perfil.png "Figura 21. Wireframe de la plantilla de perfil con aplicación a todos o a algunos. Fuente: Elaboración propia (2026).")

① Los permisos agregados y quitados se distinguen visualmente. ② El administrador elige el alcance: **a todos** cambia la plantilla del perfil (afecta también a quien lo reciba después); **a algunos** no toca la plantilla y crea una excepción por cada colaborador seleccionado. ③ Si otro administrador está editando el mismo perfil, la pantalla lo avisa; no lo bloquea, pero el segundo guardado se rechaza.

**Bitácora de auditoría (HU04 · RF-06).** Permite reconstruir quién hizo qué, cuándo y con qué respaldo. Es de solo lectura y forma parte del menú del Administrador TI.

![Wireframe de la bitácora de auditoría](assets/wireframes/w05-auditoria.png "Figura 22. Wireframe de consulta de la bitácora de auditoría. Fuente: Elaboración propia (2026).")

① Los filtros corresponden al criterio de aceptación de HU04. ② El detalle muestra el estado anterior y posterior, y recuerda que una corrección se registra como anulación. ③ Si no hay resultados, se informa y se sugiere ampliar el rango.

## Validaciones y Estados de Error

Toda validación se ejecuta **en la API**. La pantalla repite las validaciones simples solo para avisar antes de enviar. Los mensajes indican qué pasó y qué hacer, sin exponer detalles técnicos.

| Código | Situación | Mensaje al usuario | Comportamiento |
| --- | --- | --- | --- |
| ERR-01 | La identidad no existe o no está activa en el directorio | «No encontramos una identidad corporativa activa con ese usuario.» | No crea la solicitud. |
| ERR-02 | El colaborador no está activo | «El colaborador está desactivado.» | Bloquea asignar, clonar o solicitar. |
| ERR-03 | Falta ticket, motivo o justificación | «Complete los campos obligatorios marcados.» | Marca los campos y conserva lo ingresado. |
| ERR-04 | Se intenta aprobar una solicitud propia | «No puede aprobar una solicitud creada por usted.» | Código 403; el intento queda registrado. |
| ERR-05 | El registro cambió desde que se abrió | «Otro administrador modificó este registro. Recargue antes de continuar.» | Código 409; no guarda nada y ofrece recargar. |
| ERR-06 | Perfil, aplicación o departamento inactivo, o con elementos vigentes | «El elemento no está vigente.» / «Tiene elementos vigentes asociados.» | No permite la operación. |
| ERR-07 | Referencia y destino son el mismo colaborador | «Seleccione dos colaboradores distintos.» | Deshabilita la comparación. |
| ERR-08 | Rango de fechas inválido | «La fecha inicial debe ser anterior a la final.» | No ejecuta la consulta. |
| ERR-09 | El rol no permite la acción, o se piden datos de otra persona | «No tiene permiso para realizar esta acción.» | Código 403; queda registrado. |
| ERR-10 | Adjunto mayor a 5 MB o de tipo no permitido | «El archivo supera el tamaño o el formato permitido.» | Rechaza el archivo en la pantalla y en la API. |
| ERR-11 | Vigencia de excepción inválida o mayor a 180 días | «La fecha de término debe estar dentro de 180 días.» | No envía la solicitud. |
| ERR-12 | Servicio no disponible | «No fue posible completar la operación. Intente nuevamente.» | No deja operaciones a medias. |
| ERR-13 | Usuario o contraseña incorrectos | «Usuario o contraseña incorrectos.» | El mismo mensaje en ambos casos; suma un intento fallido. |
| ERR-14 | Cuenta bloqueada por intentos fallidos | «Su cuenta está bloqueada temporalmente. Intente en 15 minutos o recupere su contraseña.» | No revela si la contraseña era correcta. |
| ERR-15 | Enlace vencido o ya usado | «Este enlace ya no es válido.» | Ofrece reenviar el enlace si el acceso estaba aprobado. |
| ERR-16 | La contraseña no cumple la política | «Use al menos 12 caracteres y evite contraseñas comunes o su nombre de usuario.» | No guarda la contraseña. |

Fuente: Elaboración propia (2026).
