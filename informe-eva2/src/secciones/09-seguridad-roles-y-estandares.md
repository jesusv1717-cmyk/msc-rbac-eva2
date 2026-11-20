# Seguridad: Roles, Perfiles y Estándares

<!-- GUÍA · Sección 10 de la pauta · Criterio 2.1.5 (7 pts).
El docente aclaró (14-11) que «roles y perfiles» se refiere a los integrantes del equipo, y que los estándares
incluyen el flujo de Git y las convenciones. Se cubren además los roles del sistema (Administrador TI y
Colaborador), CAL-07 (separación de funciones), C-07 (gobierno de la auditoría) y la política de credenciales propias. -->

Esta sección cubre la seguridad en dos planos. El primero es el **equipo**: qué rol y perfil tiene cada integrante, qué estándares aplica y con qué permisos trabaja en el repositorio. El docente aclaró que este es el sentido de «roles y perfiles» en la EVA 2. El segundo es el **sistema**: qué puede hacer cada usuario del portal y cómo se protegen las credenciales, que ahora administra el propio portal.

El punto de partida son los hallazgos concretos del legado, que el cliente pidió explícitamente no reproducir:

| Hallazgo en el legado | Riesgo | Control en el diseño |
| --- | --- | --- |
| Contraseñas con cifrado reversible, visibles en pantalla y construidas como «nombre.apellido». | Robo y adivinación de credenciales (OWASP A02, A07). | *Hash* irreversible; la persona define su contraseña con un enlace; TI nunca la ve (SEC-08). |
| Sin bloqueo ante intentos fallidos ni registro de esos intentos. | Fuerza bruta (A07). | Bloqueo tras 5 intentos y registro de cada intento fallido. |
| Los permisos del menú solo ocultan opciones. | Control de acceso eludible (A01). | Cada *endpoint* exige su rol en la API y deniega por defecto (SEC-02). |
| Credenciales de SQL Server en texto plano y clave de cifrado en el código. | Fuga de secretos (A05). | Cuenta gMSA sin contraseña y secretos fuera del código (sección 5, SEC-04). |
| Cambios de permiso guardados fila por fila, sin transacción. | Cambios aplicados a medias. | Una transacción por operación (RI-07) y bloqueo de fila (RI-10). |
| La auditoría registra el inicio de sesión, pero no quién concedió cada permiso. | Falta de trazabilidad (A09). | Bitácora inmutable en la misma transacción que el cambio. |

Fuente: Elaboración propia a partir del análisis del sistema MSC.Security y de la entrevista del 14-11-2026 (2026).

## Roles y Perfiles del Equipo

Cada rol del equipo (sección 3) tiene un perfil de conocimientos, es responsable de verificar ciertos estándares y trabaja con permisos acotados en el repositorio y en los ambientes:

| Rol | Perfil | Estándares que aplica y verifica | Permisos de trabajo |
| --- | --- | --- | --- |
| Arquitectura y Backend Lead | C#, ASP.NET Core, FastEndpoints | SEC-01, SEC-02, SEC-03, SEC-06; EST-03 | Escritura en ramas; aprueba *pull requests* de backend. |
| Frontend Lead y UI/UX | React, TypeScript, accesibilidad | SEC-09 (XSS y CSP); EST-04 | Escritura en ramas; aprueba *pull requests* de la SPA. |
| Base de Datos y Rendimiento | SQL Server, Redis, pruebas de carga | SEC-01, RI-06, RI-10; EST-05 | Escritura en ramas; único con permisos de administración sobre las bases locales de prueba. |
| Requerimientos y Análisis Funcional | Análisis, trazabilidad | Que cada *pull request* cite su historia y su caso de prueba (EST-02) | Escritura en ramas y en el tablero. |
| Ciberseguridad y Auditoría | Autenticación, OWASP | SEC-04, SEC-05, SEC-07, SEC-08; revisión de seguridad de los *pull requests* sensibles | Escritura en ramas; revisor obligatorio en cambios de autenticación, roles o bitácora. |
| Scrum Master, DevOps y QA Lead | Pipeline, pruebas, Git | EST-01, EST-06; que el pipeline bloquee lo que no cumple | Administrador del repositorio y del pipeline; único que gestiona los secretos de prueba del pipeline. |

Fuente: Elaboración propia (2026).

Nadie, ni siquiera el administrador del repositorio, puede fusionar código en la rama principal sin un *pull request* aprobado por otro integrante. Esta regla aplica dentro del equipo el mismo principio de separación de funciones que el sistema aplica a sus usuarios.

## Estándares de Trabajo y de Código

El docente indicó que los estándares de la EVA 2 incluyen el flujo de Git y las convenciones de código. Cada uno se verifica de forma automática o en la revisión:

| ID | Estándar | Cómo se verifica |
| --- | --- | --- |
| EST-01 | **Flujo de Git:** *Trunk-Based Development*; ramas de vida corta con nombre `tipo/HUxx-descripcion` (por ejemplo, `feat/HU08-clonacion`); prohibido el *push* directo a `main`; fusión por *squash* tras aprobación y pipeline en verde. | Reglas de protección de la rama principal en GitHub. |
| EST-02 | **Commits y pull requests:** mensajes con *Conventional Commits* (`feat:`, `fix:`, `test:`…); cada *pull request* cita su historia (HUxx) y sus casos de prueba (CP-xx), y completa una lista de verificación de seguridad. | Plantilla de *pull request* y revisión. |
| EST-03 | **Convenciones de C#:** guía oficial de .NET (PascalCase, sufijo `Async`, tipos nulos explícitos), una operación por carpeta según REPR. | `.editorconfig` y `dotnet format` en el pipeline. |
| EST-04 | **Convenciones de TypeScript:** modo estricto, componentes funcionales, sin `any`. | ESLint y Prettier en el pipeline. |
| EST-05 | **Convenciones de base de datos:** tablas y columnas nuevas sobre el esquema de origen, en español y en minúsculas, sin prefijos (sección 7); toda modificación del esquema mediante una migración versionada, nunca a mano. | Revisión y ejecución de migraciones en el pipeline. |
| EST-06 | **Pruebas:** toda historia agrega o actualiza sus pruebas; el pipeline no permite fusionar con pruebas fallidas. | Pipeline. |

Fuente: Elaboración propia (2026).

## Roles del Sistema y Matriz de Permisos

El portal tiene dos roles para personas, que definió el cliente en la entrevista del 14-11, a los que se suman dos roles técnicos:

| Rol | Quién lo tiene | Propósito |
| --- | --- | --- |
| **Administrador TI** | El personal de TI que gestiona accesos | Administrar las acciones del portal. |
| **Colaborador** (visualizador) | Todo usuario con cuenta, incluidos los pasantes de TI | Consultar sus propios permisos en solo lectura y gestionar su cuenta. |
| Aplicación satélite | Cada aplicación que adopte el endpoint | Consultar permisos efectivos con su propia clave. |
| Proceso de sincronización | La tarea programada de la API | Crear y desactivar identidades según el directorio. |

Fuente: Elaboración propia a partir de la entrevista del 14-11-2026 y de la matriz de roles acordada por el equipo (2026).

Un **pasante de TI** recibe el rol Colaborador: según el cliente, puede tener permisos sobre otras aplicaciones, pero no sobre la aplicación de permisos. El rol Administrador TI lo asigna otro Administrador TI, y cada asignación queda en la bitácora; el primer administrador se crea en el despliegue inicial.

La separación de funciones que exigió la retroalimentación (CAL-07) se asegura con tres reglas que la API aplica entre personas:

1. **Nadie aprueba lo que creó:** ni una solicitud de acceso ni una excepción. Debe resolverla otro Administrador TI (RI-03).
2. **Nadie modifica sus propios permisos:** la API rechaza cualquier operación cuyo destino sea el propio administrador.
3. **Nadie se otorga a sí mismo el rol de Administrador TI.**

Hoy la gestión la realiza habitualmente un solo operador. Para que la regla 1 se pueda cumplir, debe existir siempre al menos un segundo Administrador TI (por ejemplo, la jefatura de TI) que pueda aprobar.

La matriz de roles y permisos acordada por el equipo es la siguiente. Se aplica en la API, *endpoint* por *endpoint*, y una acción que no aparece está **denegada por defecto**. La bitácora es inmutable para todos los roles:

| Permiso | Colaborador | Administrador TI |
| --- | --- | --- |
| Consultar sus propios permisos | Permitido, solo lectura | Permitido |
| Consultar permisos de otras personas | No permitido | Permitido |
| Gestionar su propia cuenta (contraseña) | Permitido | Permitido |
| Administrar accesos de colaboradores (solicitudes, bajas) | No permitido | Permitido¹² |
| Asignar perfiles | No permitido | Permitido² |
| Clonar permisos | No permitido | Permitido² |
| Administrar excepciones justificadas | No permitido | Permitido¹² |
| Administrar el catálogo de aplicaciones, departamentos y perfiles | No permitido | Permitido |
| Consultar la bitácora (y descargar sus adjuntos) | Sin acceso | Permitido |
| Modificar registros de la bitácora | Sin acceso | Sin acceso |
| Eliminar registros de la bitácora | Sin acceso | Sin acceso |

Fuente: Matriz de roles y permisos acordada por el equipo (2026). ¹ Nunca sobre algo que él mismo creó. ² Nunca sobre sí mismo.

Los dos roles técnicos tienen un único permiso cada uno: la **aplicación satélite** solo puede consultar permisos efectivos en el endpoint, y el **proceso de sincronización** solo puede crear y desactivar identidades según el directorio. Ninguna persona tiene esos permisos.

Cada intento denegado responde con el código 403, no revela si el recurso existe y queda registrado como evento de seguridad (`ACCESO_DENEGADO`).

## Autenticación, Contraseñas y Sesión

**Decisión: credenciales propias con ASP.NET Core Identity (D-07).** El cliente descartó el inicio de sesión con Entra ID porque exige registrar la aplicación. Como ya no hay un proveedor de identidad corporativo que resuelva la seguridad de las credenciales, el diseño la asume completa. Se usa ASP.NET Core Identity porque ya resuelve el *hash*, el bloqueo y los enlaces de un solo uso con implementaciones probadas, en lugar de programar criptografía propia.

| Aspecto | Regla |
| --- | --- |
| Almacenamiento | Solo el *hash* con sal de Identity (PBKDF2 con HMAC-SHA512 y 100.000 iteraciones en las versiones actuales de .NET). Nunca texto plano, reversible ni visible para TI (RNF-10). |
| Primera contraseña | No existe una contraseña inicial: la persona la define con un enlace de un solo uso enviado al correo corporativo (D-10). |
| Política | Mínimo 12 caracteres; se rechazan las contraseñas de una lista de las más comunes y las que contienen el usuario o el nombre, como el antiguo «nombre.apellido». No se fuerzan cambios periódicos. |
| Enlaces | Un solo uso, vencen a los 15 minutos, como recomienda OWASP (OWASP Foundation, 2021), y se guarda solo su *hash*. Al crear uno nuevo, los anteriores se invalidan. La recuperación responde lo mismo exista o no la cuenta (RNF-12). |
| Bloqueo | Tras 5 intentos fallidos, la cuenta se bloquea 15 minutos. El mensaje de error es siempre el mismo y cada intento fallido queda en la bitácora. |
| Sesión | Cookie `HttpOnly`, `Secure` y `SameSite=Strict`, cifrada con claves compartidas por todos los servidores IIS (D-11). Las operaciones que modifican datos exigen además un token *antiforgery*. |
| Inactividad y duración | Cierre tras 15 minutos sin interacción y duración máxima de 8 horas, equivalente a un turno. |
| Revocación | Al definir una contraseña nueva o al desactivar la cuenta, cambia el sello de seguridad y todas las sesiones abiertas dejan de ser válidas en la siguiente solicitud. |
| Aplicaciones satélites | Una clave por aplicación, enviada en un encabezado sobre TLS. Se guarda solo su *hash*, se rota cada 12 meses y el endpoint tiene un límite de tasa. |

Fuente: Elaboración propia (2026).

**Riesgo residual declarado:** el enlace llega al correo corporativo, por lo que quien tenga acceso al buzón de la persona podría usarlo. El vencimiento a los 15 minutos y el uso único reducen esa ventana al mínimo; si la persona no alcanza a usarlo, se reenvía sin una nueva aprobación. El cliente señaló, además, que solo se accede a las aplicaciones desde el computador corporativo, que se bloquea cuando se desactiva la cuenta.

## Controles por Capa

| Capa | Amenaza principal | Control | Prueba |
| --- | --- | --- | --- |
| Presentación (SPA) | Inyección de scripts (XSS) | React escapa el contenido; prohibido `dangerouslySetInnerHTML`; política de seguridad de contenido (CSP) sin scripts en línea. | CP-40 |
| Transporte | Interceptación | TLS en ARR, en las conexiones a SQL Server y Redis, y en el envío de correo. | Revisión de configuración |
| Autenticación | Fuerza bruta y robo de credenciales | *Hash*, bloqueo, enlaces de un solo uso y cookie protegida. | CP-43 a CP-47, CP-49 |
| API | Acceso no autorizado | Rol por *endpoint*, denegación por defecto y reglas de separación de funciones. | CP-34 a CP-37, CP-42 |
| API | Datos maliciosos | Validación en el servidor de cada solicitud; límite de tasa en el endpoint y en el inicio de sesión. | CP-24, CP-39 |
| Datos | Inyección SQL; alteración de la bitácora; concurrencia | Consultas parametrizadas; cuenta con mínimo privilegio; bitácora *ledger append-only*; bloqueo de fila. | CP-38, CP-39, CP-28 |
| Caché | Datos obsoletos | Clave de versión y TLS con ACL limitada a `permisos:*`. | CP-41 |
| Operación | Ataques no detectados | Registro sin contraseñas, enlaces ni datos sensibles; alertas por intentos repetidos, caída de Redis, freno de la sincronización y fallas de correo. | Revisión de alertas en la EVA 3 |

Fuente: Elaboración propia (2026).

## Estándares de Programación Segura

El equipo adopta como lista de verificación el nivel 2 del estándar OWASP ASVS (OWASP Foundation, 2021), y prioriza los riesgos del OWASP Top 10:2021 (Open Web Application Security Project, 2021). Cada estándar declara su motivo y cómo se verifica:

| ID | Estándar | Motivo | Cómo se verifica |
| --- | --- | --- | --- |
| SEC-01 | Solo consultas parametrizadas; prohibido concatenar SQL. | Inyección (A03). | Analizador de .NET en el pipeline y CP-39. |
| SEC-02 | Cada *endpoint* declara su rol; la política por defecto deniega. | Control de acceso (A01). | Prueba que recorre todos los *endpoints* sin sesión y con el rol incorrecto (CP-35). |
| SEC-03 | Toda solicitud tiene un validador en el servidor. | Datos maliciosos (A03, A04). | Pruebas unitarias de cada validador. |
| SEC-04 | Ningún secreto en el código ni en la configuración versionada. | Fuga de secretos (A05). | Escáner de secretos que bloquea el *pull request* (CP-48). |
| SEC-05 | Sin dependencias con vulnerabilidades conocidas de severidad alta. | Componentes vulnerables (A06). | `dotnet list package --vulnerable` y `npm audit` en el pipeline. |
| SEC-06 | Errores con mensaje genérico, sin trazas internas. | Exposición de información (A05). | Prueba que fuerza un error y revisa la respuesta. |
| SEC-07 | Todo cambio se audita en la misma transacción; los registros técnicos no incluyen contraseñas, enlaces ni datos sensibles. | Registro insuficiente (A09). | CP-32 y revisión de registros. |
| SEC-08 | Las credenciales solo se manejan con ASP.NET Core Identity: nunca texto plano, cifrado reversible ni algoritmos propios. | Fallas criptográficas y de autenticación (A02, A07). | Revisión del modelo de datos (RI-09) y CP-46. |
| SEC-09 | La SPA no inserta HTML sin escapar y se sirve con CSP. | XSS (A03). | Regla de ESLint y CP-40. |

Fuente: Elaboración propia (2026).

## Gobierno de la Auditoría

Esta subsección responde al compromiso C-07. Los plazos son propuestas que deben validarse con el cliente:

- **Qué se registra:** todo cambio de permisos, perfiles, plantillas, excepciones, cuentas y bajas (incluidas las automáticas), los inicios de sesión fallidos, los accesos denegados y las descargas de adjuntos. Cada evento indica quién (una persona o el proceso), a quién, qué, cuándo, el ticket y la justificación.
- **Retención:** mínimo 2 años en línea y 5 años en respaldo (propuesta). Ningún evento se elimina antes de ese plazo.
- **Respaldo:** la bitácora se incluye en los respaldos de SQL Server, con un RPO de 15 minutos. Los resúmenes criptográficos (*digests*) del ledger se exportan periódicamente fuera de la base, lo que permite demostrar que la bitácora no fue alterada, incluso por un administrador de base de datos.
- **Quién la lee:** los Administradores TI, en solo lectura. Nadie puede modificarla ni borrarla, y las correcciones se registran como anulaciones. Cada día, los administradores reciben un resumen de las bajas automáticas o del freno de la sincronización.
- **Separación de funciones:** se asegura con las tres reglas de la subsección de roles del sistema. Además, ningún rol puede modificar ni borrar la bitácora, por lo que un administrador no puede ocultar sus propios cambios.
