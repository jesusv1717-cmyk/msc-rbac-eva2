# Síntesis del Diagnóstico y Alcance

<!-- GUÍA (no se imprime) · Sección 2 de la pauta EVA 2.
Cubre: necesidades numeradas (N-01…); tabla de compromisos C-01..C-07 y CAL-01..CAL-09; cambios tras la
EVA 1 y tras la entrevista con el cliente del 14-11-2026 (Anexo B). Regla: el alcance aprobado NO se recorta. -->

Este informe traduce el diagnóstico aprobado en la EVA 1 en un diseño que se puede construir. Incorpora además lo acordado con el cliente en la entrevista del 14 de noviembre de 2026, cuyo resumen está en el Anexo B. Cada decisión de las secciones siguientes se vincula con una necesidad de esta sección, identificada con un código N-XX.

## Términos Usados en este Informe

Para evitar ambigüedades, el informe usa siempre estos términos con un único significado:

| Término | Significado |
| --- | --- |
| Aplicación | Uno de los 37 sistemas de MSC Chile que consultan permisos (también llamados satélites). |
| Permiso | Acceso a una aplicación con una de sus opciones; equivale a un registro de `transaccion` en el esquema de origen (sección 7). |
| Perfil | Paquete de permisos de varias aplicaciones que se asigna de una vez a una persona según su puesto (por ejemplo, «Operador de muelle»). Cada persona tiene un solo perfil vigente. |
| Excepción | Permiso que se concede o se retira a una persona puntual, fuera de su perfil, con ticket, justificación, vigencia y aprobación de otro administrador. |
| Colaborador | Persona de MSC Chile que existe en el directorio corporativo. Se representa con un único registro `usuario`, que reúne identidad y credencial del portal (ya no hay tablas separadas). |
| Cuenta | La capacidad de ese mismo `usuario` para ingresar al portal: existe desde que la sincronización lo detecta, y se completa con contraseña al activarse. |
| Rol del portal | Lo que un usuario puede hacer dentro del portal: Administrador TI o Colaborador. No debe confundirse con un perfil. |

Fuente: Elaboración propia (2026).

## Problema y Actores

MSC Chile administra los accesos de aproximadamente 1.000 usuarios de dos razones sociales a un catálogo de 37 aplicaciones, de las cuales el 94 % depende de un sistema centralizado de control de acceso. Ese sistema es hoy una aplicación de escritorio en VB.NET (MSC.Security) que asigna permisos casilla por casilla, aplicación por aplicación, sin una abstracción de perfiles.

El diagnóstico identificó cuatro causas del problema:

1. **Gestión granular y manual:** cada alta o cambio de puesto obliga a marcar decenas de permisos individuales.
2. **La «doble ventana»:** para replicar los accesos de un par, el operador abre dos instancias de la aplicación y coteja permiso por permiso.
3. **Pérdida del atributo «departamento»:** tras la migración a Microsoft Entra ID, ese metadato no llega de forma consistente.
4. **Sobrecarga de SQL Server:** la resolución de permisos vive en vistas y procedimientos almacenados poco indexados, consultados por las 37 aplicaciones satélites.

El análisis del código legado agregó un quinto problema, que el cliente pidió explícitamente no reproducir: **las contraseñas del portal se guardan de forma reversible, se muestran en pantalla y suelen construirse como «nombre.apellido»**.

Los actores se mantienen respecto de la EVA 1, con un cambio: el colaborador pasa de beneficiario indirecto a **usuario directo**, porque ahora puede consultar sus propios permisos.

| Actor | Tipo | Relación con la solución |
| --- | --- | --- |
| Administrador TI (personal de soporte y jefatura de TI) | Usuario directo | Aprueba accesos, asigna perfiles, copia los perfiles de un colaborador a otro, gestiona excepciones y consulta la bitácora. |
| Colaborador de MSC Chile | Usuario directo (nuevo) | Solicita su acceso, consulta en solo lectura sus permisos y cambia su contraseña. |
| Equipo de aplicaciones satélites | Interesado técnico | Sus 37 sistemas consultarán los permisos efectivos mediante el nuevo endpoint REST, que reemplaza a los procedimientos y vistas legados. |
| Directorio corporativo (AD) | Sistema externo | Entrega la lista de identidades activas; no autentica el portal. |

Fuente: Elaboración propia a partir del informe de la EVA 1 y de la entrevista del 14-11-2026 (2026).

## Necesidades Identificadas

Para que la trazabilidad se pueda auditar fila por fila, cada necesidad recibe un identificador. N-01 a N-07 provienen del diagnóstico de la EVA 1; N-08 y N-09, de la calibración de la retroalimentación; y N-10 y N-11, de la entrevista con el cliente.

| ID | Necesidad | Origen |
| --- | --- | --- |
| N-01 | Asignar los accesos de un colaborador a partir de su perfil, en una sola operación. | Causa 1 |
| N-02 | Replicar o comparar los accesos de un usuario de referencia sin la doble ventana. | Causa 2 |
| N-03 | Mantener la estructura de departamentos y perfiles sin depender del directorio. | Causa 3 |
| N-04 | Resolver los permisos de los satélites con baja latencia y sin sobrecargar SQL Server. | Causa 4 |
| N-05 | Atender casos especiales con permisos fuera del perfil, sin alterar el permiso estándar. | Levantamiento EVA 1 |
| N-06 | Saber quién concedió cada acceso, cuándo, por qué y con qué respaldo. | Consecuencia: trazabilidad |
| N-07 | Responder a los satélites «la misma pregunta con la misma respuesta», sin interrupciones 24/7, mediante un endpoint expuesto para su consumo. | Entrevista 14-11 (aclaración: no es una restricción de arquitectura) |
| N-08 | Retirar los accesos oportunamente ante un egreso o cambio de perfil, y revisarlos periódicamente. | CAL-06 |
| N-09 | Separar las funciones de quien solicita y quien aprueba un acceso o un privilegio excepcional. | CAL-07 |
| N-10 | Que cada colaborador pueda ver a qué aplicaciones y con qué perfiles tiene asignado. | Entrevista 14-11 |
| N-11 | Credenciales seguras: contraseñas que nadie de TI conoce, almacenadas sin posibilidad de revertirlas. | Entrevista 14-11 y legado |

Fuente: Elaboración propia (2026).

## Alcance Incluido y Excluido

El alcance aprobado en la EVA 1 se mantiene íntegro: no se retira ningún elemento. La retroalimentación y la entrevista agregan elementos, que este diseño incorpora.

**Incluido en el alcance:**

- Portal web para el personal de TI y, en modo de solo lectura, para cada colaborador. Se ejecuta en Microsoft Edge dentro de Citrix Workspace.
- Catálogo propio de departamentos y perfiles, sobre el esquema que envió el docente.
- Asignación por perfil, comparación y clonación, excepciones justificadas con aprobación, y bajas.
- Bitácora de auditoría inmutable.
- Endpoint REST de permisos efectivos con caché en Redis, como canal único de consumo para las aplicaciones satélites.
- **Agregado tras la EVA 1:**
  - Inicio de sesión con credenciales propias.
  - Solicitud y activación de acceso, y definición de contraseña por enlace de un solo uso.
  - Vista personal de permisos.
  - Sincronización cada 10 minutos con el directorio corporativo.
  - Catálogo de aplicaciones.
  - Reglas de propagación y de clonación.
  - Condiciones de medición y disponibilidad.
  - Gestión de secretos.

**Excluido del alcance (sin cambios respecto de la EVA 1):**

- Diseño para dispositivos móviles.
- Integración bidireccional automática con los sistemas de Recursos Humanos.
- Acceso a datos productivos de MSC Chile.

La modificación del código de las 37 aplicaciones satélites para que consuman el nuevo endpoint deja de tratarse como una exclusión cerrada: es un punto en conversación con el cliente (Anexo B), que se resuelve aplicación por aplicación a medida que cada equipo confirma su migración.

Respecto del «autoservicio para usuarios finales» excluido en la EVA 1: la vista personal es **solo de lectura** y la solicitud de acceso **no crea identidades**, porque solo pueden pedirla personas que ya existen en el directorio corporativo. Ninguna de las dos permite que un colaborador se otorgue permisos, por lo que la exclusión se mantiene.

## Cambios y Compromisos Asumidos tras la EVA 1

La retroalimentación de la EVA 1 dejó siete compromisos (C-01 a C-07) y nueve agregados de calibración (CAL-01 a CAL-09). La siguiente tabla indica dónde responde este informe a cada uno:

| ID | Compromiso o agregado | Dónde se responde | Estado |
| --- | --- | --- | --- |
| C-01 | Cronograma con semanas, hitos EVA 2/3/4, responsables y *Definition of Done* | Sección 3 | Incluido; faltan nombres y fechas de EVA 3 y EVA 4 |
| C-02 / CAL-02 | Regla de propagación al modificar la plantilla de un perfil | Secciones 7 y 10 | Incluido |
| C-03 / CAL-04 | Escenario de medición del P95 del endpoint de permisos | Sección 10 (diseño); EVA 3 (ejecución) | Diseño incluido |
| C-04 | Entrevistas a operadores de TI y a RRHH | Anexo B | **Parcial:** entrevista con el cliente realizada; RRHH pendiente |
| C-05 | Rol de Redis y SQL Server en el camino de consulta | Secciones 4 y 8 | Incluido |
| C-06 / CAL-03 | Efecto de la clonación sobre el modelo de permisos | Secciones 7 y 10 | Incluido |
| C-07 | Gobierno de la auditoría y separación de funciones | Sección 9 | Incluido |
| CAL-01 | Línea base medible del proceso actual | Anexo A | **Parcial:** volumen confirmado; tiempos por operación pendientes |
| CAL-05 | Disponibilidad objetivo, RTO/RPO y degradación si cae Redis | Sección 5 | Incluido |
| CAL-06 | Flujo de baja y recertificación de accesos | Secciones 2, 6 y 7 | Incluido |
| CAL-07 | Roles del portal con separación de funciones | Sección 9 | Incluido |
| CAL-08 | Ciclo de vida del usuario | Secciones 4 y 7 | Incluido |
| CAL-09 | Gestión de secretos y retención documental | Secciones 5 y 9 | Incluido |

Fuente: Elaboración propia a partir de la retroalimentación de la EVA 1 (2026).

Además, el diseño introduce los siguientes cambios respecto de la EVA 1, cada uno con su origen:

| Cambio | Antes (EVA 1) | Ahora | Origen |
| --- | --- | --- | --- |
| Autenticación (RNF-03) | Corporativa con Entra ID | **Usuario y contraseña propios**, con hash seguro. El directorio entrega identidades, no autentica. | Cliente: registrar la aplicación en Entra ID es complejo. |
| Roles del portal | No definidos | **Administrador TI** y **Colaborador** (visualizador), más roles técnicos. | Cliente: entrevista del 14-11. |
| Requerimientos nuevos | — | Inicio de sesión, solicitud y activación de acceso, definición y recuperación de contraseña, vista personal y catálogo de aplicaciones (RF-13 a RF-18). | Cliente y CAL-07. |
| Sincronización de identidades | Conciliación con Entra ID | Comparación con la lista de activos de AD **cada 10 minutos**, igual que el proceso actual del cliente. | Cliente. |
| Propagación de cambios de perfil | No definida | El administrador elige aplicarla **a todos o solo a algunos** colaboradores del perfil; como el esquema de origen no versiona perfiles, «a todos» cambia la plantilla y «a algunos» se resuelve con excepciones individuales. | Cliente (esquema de origen) y C-02. |
| Infraestructura | No definida | **Granja de servidores IIS con balanceo de carga (ARR)**; control explícito de concurrencia entre servidores. | Cliente. |
| Rendimiento (RNF-01) | P95 < 20 ms sin condiciones | Meta condicionada a la infraestructura confirmada, medida con **600 consumidores concurrentes** en hora punta. | Cliente y CAL-04. |
| Historias | HU01 y HU02 eran épicas | Divididas, y con historias nuevas para el acceso y la vista personal. | Retroalimentación. |
| Coherencia entre informe y defensa | Stack presentado como pendiente en la defensa | El stack se adopta como decisión de diseño, con alternativas descartadas (sección 4). | Retroalimentación. |
| Coexistencia con el legado | Procedimientos fachada y vistas de compatibilidad; endpoint de adopción opcional para los satélites. | Se eliminan los procedimientos y vistas legados; el endpoint REST es el único canal de consumo para las satélites. | Cliente: retroalimentación posterior a la entrevista del 14-11. |

Fuente: Elaboración propia (2026).
