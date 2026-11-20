# Modelo de Datos No Relacional

<!-- GUÍA · Sección 9 de la pauta · Criterio 2.1.4.
Cubre: qué guarda, por qué no relacional, cómo se consulta, relación con el resto; C-05 (claves, TTL,
invalidación y comportamiento si Redis cae). Señal de riesgo: «colección creada para cumplir». -->

La solución usa un único almacén no relacional: **Redis**, una base de datos clave-valor que mantiene los datos en memoria. No se agregó para cumplir con la pauta: existe para resolver la necesidad N-04 y el requerimiento RNF-01, que exigen responder a las aplicaciones satélites con baja latencia sin volver a sobrecargar SQL Server. Además, Redis ya existe en la infraestructura de MSC Chile.

## Información que se Almacena

Redis guarda **un documento por colaborador** con sus permisos efectivos ya resueltos, listo para entregarse a una aplicación satélite. No guarda contraseñas, datos personales más allá del usuario y el nombre, ni información de auditoría.

Redis **no es fuente de verdad**. Todo lo que contiene se puede reconstruir desde `permiso_efectivo` en SQL Server. Si Redis se vacía o se cae, no se pierde ningún dato: solo aumenta la latencia mientras la caché se vuelve a llenar.

## Estructura de Claves y Valores

El diseño usa dos tipos de clave:

| Clave | Tipo de valor | Contenido | Expiración |
| --- | --- | --- | --- |
| `permisos:usuario:{id_usuario}` | Cadena con un documento JSON | Permisos efectivos del colaborador, agrupados por sistema. | TTL de 10 minutos. |
| `permisos:version:{id_usuario}` | Número entero | Versión de los permisos del colaborador. Aumenta con cada cambio confirmado en SQL Server. | Sin expiración. |

Fuente: Elaboración propia (2026).

Un ejemplo del documento guardado en `permisos:usuario:jperez` (datos sintéticos):

```json
{
  "usuario": "jperez",
  "estado": "ACTIVO",
  "version": 42,
  "generadoUtc": "2026-11-20T13:05:11Z",
  "sistemas": [
    {
      "sistema": 10,
      "permisos": [ { "id": 2, "nombre": "CONSULTA" } ],
      "transacciones": [ 101, 104 ]
    },
    {
      "sistema": 20,
      "permisos": [ { "id": 5, "nombre": "OPERADOR" } ],
      "transacciones": [ 201, 202, 207 ]
    }
  ]
}
```

El documento incluye tanto los permisos como las transacciones de cada sistema, porque los satélites consultan las dos cosas: algunos validan el permiso y otros habilitan opciones de menú por transacción. Así, una sola lectura responde cualquiera de las dos consultas.

## Justificación del Modelo No Relacional

Modelar esta información igual que en el modelo relacional no conviene por cuatro motivos:

1. **El patrón de acceso es una sola clave.** Los satélites siempre preguntan lo mismo: «¿qué permisos tiene este usuario?». No hay filtros, uniones ni consultas por otros campos. Un almacén clave-valor resuelve exactamente eso en una operación.
2. **El documento está desnormalizado a propósito.** Para armar la respuesta en SQL hay que unir la proyección con permisos y transacciones. En Redis la respuesta ya está armada. Guardar esa misma desnormalización en SQL Server duplicaría datos y rompería la normalización del modelo relacional.
3. **La memoria da la latencia.** Leer una clave en memoria evita el disco y el motor de consultas, que es lo que permite apuntar al P95 menor a 20 ms (RNF-01).
4. **La expiración es nativa.** Redis elimina las claves vencidas por sí solo; en SQL Server habría que programar una limpieza.

El tamaño también es acotado. Con unos 1.000 colaboradores y documentos estimados en pocos kilobytes cada uno, la caché completa ocupa del orden de algunos megabytes. El patrón de uso favorece la caché: según el cliente, en hora punta unos 300 usuarios trabajan a la vez y cada uno usa varias aplicaciones, de modo que los permisos de las mismas personas se consultan muchas veces seguidas. El tamaño real del documento se medirá en la EVA 3, porque también es un parámetro de la prueba de carga (CAL-04).

## Consultas, Expiración e Invalidación

Las operaciones sobre Redis son pocas y están acotadas:

| Momento | Operación | Quién la ejecuta |
| --- | --- | --- |
| Un satélite consulta permisos | `GET permisos:usuario:{u}`. Si el endpoint recibe `?sistema=10`, la API filtra ese sistema dentro del documento. | Consulta para satélites |
| La clave no existe (fallo de caché) | Lee la proyección en SQL Server, arma el documento y lo guarda con `SET ... EX 600` mediante un script que verifica la versión (ver más abajo). | Consulta para satélites |
| Se confirma un cambio de permisos | `INCR permisos:version:{u}` y `DEL permisos:usuario:{u}` para cada colaborador afectado. | Motor de permisos |
| Cambia la plantilla de un perfil | Lo mismo que el caso anterior, para cada colaborador que tiene el perfil. Los afectados se obtienen de SQL Server, no de Redis. | Motor de permisos |

Fuente: Elaboración propia (2026).

**Por qué existe la clave de versión.** Sin ella podría ocurrir esta secuencia: un satélite lee la proyección antigua; justo después, un operador revoca un permiso y se borra la clave; y finalmente el satélite guarda en Redis el documento antiguo. El permiso revocado volvería a aparecer hasta que venza el TTL. Para impedirlo, el documento se guarda con un script de Redis que es atómico y que solo escribe si la versión leída desde SQL Server es igual o mayor que `permisos:version:{u}`. Así, **un permiso revocado no puede reaparecer desde la caché**. La prueba de seguridad correspondiente está en la sección 10.

**Si Redis no está disponible**, se aplica el modo degradado de las secciones 4 y 5: la API espera como máximo 50 ms, responde desde la proyección en SQL Server y emite una alerta. Cuando Redis vuelve, las claves se llenan otra vez a medida que llegan las consultas.

**Relación con el resto de la solución.** Redis solo lo usa la consulta para satélites. Todas las aplicaciones satélites consultan los permisos a través del endpoint REST, que sí puede leer de Redis. Esto corrige una imprecisión de la presentación de la EVA 1, donde se dijo que los procedimientos legados leerían de Redis: en este diseño no existen procedimientos legados que consulten permisos.

**Qué no hace Redis.** El docente propuso usar Redis como cola FIFO para ordenar las modificaciones concurrentes. El diseño la evalúa y prefiere el bloqueo de fila en SQL Server (decisión D-09), de modo que Redis mantiene un único propósito: la caché de lectura. Así, una caída de Redis nunca impide modificar permisos.

**Seguridad de Redis.** La conexión usa TLS. El usuario de Redis de la aplicación tiene permisos (ACL) solo sobre las claves `permisos:*` y solo para los comandos `GET`, `SET`, `DEL`, `INCR` y `EVALSHA`. La tasa de aciertos de caché se obtiene de las estadísticas de Redis y es una de las métricas de la prueba de rendimiento (CAL-04).
