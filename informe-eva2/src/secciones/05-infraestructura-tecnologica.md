# Infraestructura Tecnológica

<!-- GUÍA · Sección 6 de la pauta · Criterio 2.1.2.
Cubre: dónde se ejecuta, dónde persisten los datos, servicios externos, configuración; CAL-05 (disponibilidad,
RTO/RPO, degradación) y CAL-09 (secretos y rotación). Datos del cliente (14-11): IIS + ARR, SQL Server ~300 GB RAM,
sin acceso a Key Vault, ~300 usuarios en hora punta. Los objetivos de disponibilidad son PROPUESTAS por validar. -->

Esta sección indica dónde se ejecuta cada componente, dónde se guardan los datos, qué servicios externos intervienen y qué se necesita para operar. Se distinguen dos ambientes: el **despliegue objetivo** en la infraestructura que describió el cliente, y el **ambiente de desarrollo y pruebas** donde el equipo construye y valida el MVP. El equipo no tiene acceso a la infraestructura ni a los datos productivos de MSC Chile, por lo que lo que se demuestre en la EVA 3 se ejecuta en el segundo ambiente.

## Entorno de Ejecución

| Componente | Despliegue objetivo (MSC Chile) | Desarrollo y pruebas (equipo) |
| --- | --- | --- |
| Portal (SPA) | Archivos estáticos servidos por la API; se ejecuta en Microsoft Edge dentro de Citrix Workspace. | Servidor de desarrollo de Vite. |
| Balanceo de carga | Servidor IIS con *Application Request Routing* (ARR), que reparte las solicitudes y termina TLS. | Un proxy inverso local delante de dos instancias de la API, para probar la concurrencia entre servidores. |
| API RBAC (.NET 10) | Dos o más servidores Windows con IIS, mediante el módulo de ASP.NET Core. | Dos instancias en el equipo de desarrollo. |
| SQL Server | Instancia corporativa existente (unos 300 GB de RAM, según el cliente); el esquema de origen (sección 7), en la misma base que usan los satélites. | Contenedor de SQL Server 2022 con el esquema y datos sintéticos. |
| Redis | Instancia corporativa existente. | Contenedor de Redis. |
| Directorio corporativo | API de usuarios activos de AD. El docente ofreció levantar una versión de prueba. | API simulada con la lista de usuarios sintéticos. |
| Correo | Servidor SMTP corporativo con TLS. | Servidor de correo de prueba en contenedor, que captura los mensajes sin enviarlos. |

Fuente: Elaboración propia a partir de la entrevista del 14-11-2026 (2026).

Los contenedores se usan solo en desarrollo y pruebas: permiten levantar el mismo ambiente en el equipo de cada integrante, y las pruebas de integración usan SQL Server y Redis reales (Testcontainers). En producción, la API se publica en IIS, que es la plataforma que el cliente ya opera.

## Persistencia de Datos

| Dato | Dónde se guarda | Durabilidad y respaldo |
| --- | --- | --- |
| Modelo del esquema de origen (`sistema`, `perfil`, `transaccion`, `usuario`, `permiso_adiciona`) | SQL Server, esquema del sistema MSC.Security (sección 7) | Fuente de verdad. Respaldo según la política corporativa. |
| Credenciales de `usuario` (*hash* de contraseña, rol, estado, intentos fallidos, bloqueo) | SQL Server, tabla `usuario`; PBKDF2 vía ASP.NET Core Identity | Igual que el resto del esquema. Nunca se guarda una contraseña, solo su *hash*. |
| Enlaces de un solo uso | SQL Server, tabla `link_activacion` | Solo se guarda el *hash* del enlace, con su vencimiento. |
| Claves de protección de sesión | SQL Server | Compartidas por todos los servidores IIS (decisión D-11). |
| Proyección de permisos efectivos | SQL Server, tabla `permiso_efectivo` (agregada por el diseño, sección 7) | Se puede reconstruir desde `perfil_sistema_transaccion` y `permiso_adiciona`. |
| Bitácora de auditoría | SQL Server, tabla `auditoria` (*append-only*) | Respaldo completo diario y del registro de transacciones cada 15 minutos (propuesta). |
| Documentos de respaldo de excepciones | Pendiente de definir | El esquema de origen no trae una tabla de adjuntos; queda como brecha a confirmar con el cliente (sección 7). |
| Caché de permisos | Redis | Volátil: se reconstruye desde la proyección. |

Fuente: Elaboración propia (2026).

Los adjuntos se guardan en SQL Server para no agregar otra pieza de infraestructura y para que adjunto y evento queden bajo el mismo respaldo y los mismos permisos. El formato y el tamaño máximo siguen pendientes de validar con el cliente; mientras tanto se propone un máximo de 5 MB.

En el ambiente de pruebas se usan solo datos sintéticos. Como referencia del comportamiento legado se usa la base demo reconstruida a partir del código de MSC.Security. El docente se comprometió a enviar el **esquema real** de la base de datos; cuando llegue, reemplazará a la base demo en las pruebas de regresión.

## Servicios Externos e Integraciones

| Servicio | Uso en la solución | Por qué es pertinente |
| --- | --- | --- |
| Directorio corporativo (AD) | Fuente de las identidades (nombre, correo, departamento y estado). Se consulta su lista de activos cada 10 minutos. **No autentica el portal.** | Es el origen de las identidades en el legado y en el proceso actual del cliente. |
| Servidor de correo (SMTP) | Envío de enlaces de activación, cambio y recuperación de contraseña, y del resumen diario de bajas. | Es el canal corporativo verificado de cada colaborador. |
| Redis | Caché de permisos efectivos. | Permite cumplir RNF-01 sin sobrecargar SQL Server; ya existe en la infraestructura del cliente. |
| SQL Server corporativo | Fuente de verdad del modelo RBAC. | Restricción del cliente: stack corporativo ya operado por MSC Chile. |
| Citrix Workspace y Edge | Entorno donde trabaja el personal. | No se modifica; la SPA se diseña para ese entorno (RNF-06). |
| Sistema de tickets de TI | Solo se guarda el identificador del ticket en cada operación. | Integrarse con él no está en el alcance. |

Fuente: Elaboración propia (2026).

Para operar, la API necesita la siguiente configuración. Los valores secretos nunca se escriben en archivos versionados:

| Parámetro | Ejemplo o valor de diseño | ¿Es secreto? |
| --- | --- | --- |
| Conexión a SQL Server | Servidor y base; autenticación con la identidad del servidor, sin contraseña | No, porque no contiene contraseña |
| Conexión a Redis | Servidor, puerto TLS y usuario ACL con contraseña | Sí |
| Conexión SMTP | Servidor, puerto y credencial de envío | Sí |
| URL y clave de la API de AD | Entregadas por el cliente | Sí, la clave |
| Claves de las aplicaciones satélites | Una por aplicación; se guarda solo su *hash* | Sí |
| Frecuencia de la sincronización y umbral del freno | 10 minutos; 5 % | No |
| Vigencia de los enlaces | 15 minutos (recomendación OWASP) | No |
| Intentos fallidos antes del bloqueo y su duración | 5 intentos; 15 minutos | No |
| Tiempo de vida de la caché y espera máxima a Redis | 10 minutos; 50 ms | No |

Fuente: Elaboración propia (2026).

## Configuración y Gestión de Secretos

El análisis del legado mostró que `app.config` guarda usuario y contraseña de SQL Server en texto plano, y que la clave de cifrado está escrita en el código (`ModSistema.vb`). El cliente indicó además que **no es posible dar acceso a Azure Key Vault**. Por eso el diseño reduce al mínimo los secretos y protege los que quedan con las herramientas que ya existen en un servidor Windows con IIS (CAL-09, RNF-09):

1. **SQL Server sin contraseña.** El sitio de IIS se ejecuta con una cuenta de servicio administrada de grupo (gMSA), y la API se conecta a SQL Server con esa identidad. Windows rota su contraseña automáticamente y nadie la conoce.
2. **Secretos restantes fuera del código.** Las credenciales de Redis, SMTP y la API de AD se guardan como variables de entorno del grupo de aplicaciones de IIS, legibles solo por su cuenta de servicio. Nunca están en el repositorio ni en el paquete desplegado.
3. **Nada en el repositorio.** El pipeline ejecuta un escáner de secretos en cada *pull request* y bloquea la fusión si encuentra uno. En desarrollo, cada integrante usa `dotnet user-secrets` o un archivo `.env` excluido por `.gitignore`, siempre con credenciales de contenedores de prueba.
4. **Mínimo privilegio.** La cuenta de la aplicación no puede modificar ni borrar la bitácora, ni administrar la base de datos.
5. **Rotación declarada:**

| Secreto | Rotación | Cómo se rota sin interrumpir |
| --- | --- | --- |
| Cuenta de servicio (gMSA) para SQL Server | Automática, la gestiona Windows | No requiere intervención. |
| Credencial de Redis (usuario ACL) | Cada 90 días | Se crea la nueva credencial, se actualiza la variable y se reciclan los servidores IIS uno a uno; luego se retira la anterior. |
| Credencial SMTP y clave de la API de AD | Cada 90 días o según la política del cliente | Igual que la anterior. |
| Claves de las aplicaciones satélites | Cada 12 meses | Cada aplicación puede tener dos claves vigentes durante el cambio. |
| Certificado TLS de ARR | Según su vencimiento | Alerta 30 días antes. |

Fuente: Elaboración propia (2026).

## Disponibilidad y Continuidad

La EVA 1 prometió *zero downtime* sin una meta medible (CAL-05). Este diseño la reemplaza por objetivos verificables. Son **propuestas de diseño** que deben validarse con el cliente, porque dependen de su operación y de su política de respaldos.

| Servicio | Disponibilidad objetivo | RTO | RPO |
| --- | --- | --- | --- |
| Endpoint REST de permisos | 99,9 % mensual, 24/7 | 15 minutos | 0: la API no guarda estado propio |
| Portal (administración y vista personal) | 99,5 % en horario hábil | 4 horas | 0: los datos están en SQL Server |
| Bitácora de auditoría | Igual a SQL Server | 4 horas | 15 minutos |

Fuente: Elaboración propia (2026).

El RTO es el tiempo máximo aceptable para recuperar el servicio después de una falla. El RPO es la cantidad máxima de datos que se acepta perder, medida en tiempo. Ante cada falla posible, el sistema declara cómo se degrada:

| Falla | Efecto | Comportamiento del sistema |
| --- | --- | --- |
| Redis no responde | Aumenta la latencia del endpoint. | Se lee desde la proyección y se emite una alerta. Objetivo degradado: P95 bajo 100 ms, a medir en la EVA 3. |
| Cae un servidor IIS | Ninguno visible. | ARR deja de enviarle tráfico; las sesiones siguen válidas en los demás servidores (D-11). |
| Caen todos los servidores IIS | El portal, el endpoint y la consulta de permisos de las satélites no están disponibles hasta que un servidor IIS vuelva. | Nadie gana ni pierde permisos; al volver un servidor, ARR retoma el tráfico sin intervención. |
| La API de AD no responde o entrega una lista anómala | No se detectan altas ni bajas nuevas. | La sincronización no desactiva a nadie y avisa a TI; reintenta en la siguiente ejecución. |
| El servidor de correo no responde | Los enlaces no llegan. | Los envíos se reintentan; el administrador ve el estado del envío y puede reenviar. |
| SQL Server no responde | Todo el sistema se detiene, igual que hoy. | Se cubre con la alta disponibilidad corporativa de SQL Server, que está fuera del alcance. |

Fuente: Elaboración propia (2026).

Finalmente, «sin interrupción» se define de forma medible para los despliegues:

- **Actualización de la API:** se actualiza un servidor IIS a la vez, retirándolo antes del balanceo, de modo que siempre hay al menos uno atendiendo.
- **Cambios en la base de datos:** las migraciones son compatibles hacia atrás. Primero se agregan las estructuras nuevas, y las antiguas se retiran solo cuando ninguna versión en ejecución las usa.
