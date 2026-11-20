# Bloque 6 · Seguridad, Pruebas y Trazabilidad

**Diapositivas 16, 17 y 18 · Informe, secciones 9, 10 y 11 · Criterios 2.1.5 y 2.1.6 (7 pts cada uno) y calidad del informe (6 pts).**

## Qué Dominar

- Los 2 roles del sistema: Administrador TI y Colaborador (los pasantes son colaboradores). Y las reglas: nadie aprueba lo que creó, nadie se da permisos ni roles a sí mismo y todo se valida en el servidor.
- La matriz de roles y permisos del equipo (informe, sección 9): saber decir qué puede y qué no puede cada rol.
- Que la regla de aprobación exige **al menos dos administradores** (riesgo R-13).
- La tabla de contraseñas «antes y ahora», y la política: *hash* irreversible, mínimo 12 caracteres, bloqueo tras 5 intentos, enlace de un solo uso que vence a los 15 minutos y cierre de sesión por inactividad (15 minutos) y por duración máxima (8 horas).
- Las cifras del plan de pruebas: 23 funcionales, 12 negativas, 16 de seguridad (51 en total) y 4 escenarios de carga, hasta 600 consultas simultáneas (unos 300 usuarios en hora punta).
- Cómo se lee un caso de prueba: precondición, pasos y resultado observable. Tengan uno memorizado (CP-06 o CP-34).
- La cadena de trazabilidad completa con el ejemplo de «Mis permisos».

## Frases Clave

> «Ocultar un botón no es seguridad: cada acción se vuelve a autorizar en el servidor.»

> «Cada requisito tiene al menos una prueba con un resultado que se puede comprobar sin interpretación.»

## Preguntas Probables

**¿Por qué este control de seguridad es necesario en este proyecto?**
Porque el sistema administra los privilegios de toda la empresa: quien lo controla, controla el acceso a las 37 aplicaciones. Por ejemplo, la regla de que nadie aprueba lo que creó evita que una sola persona se otorgue privilegios sin que nadie lo note.

**¿Quién revisa la bitácora?**
Los Administradores TI, en solo lectura. Ningún rol puede modificarla ni borrarla (tabla *ledger*), así que un administrador no puede ocultar sus propios cambios; las correcciones se registran como anulaciones.

**¿Por qué el enlace por correo vence a los 15 minutos?**
Porque lo recomienda OWASP para enlaces de activación y recuperación: mientras menos tiempo sirva, menos riesgo hay si alguien accede al correo. Si la persona no alcanza a usarlo, pide otro sin una nueva aprobación.

**¿Cómo protegen las contraseñas si ya no usan Microsoft?**
Con ASP.NET Core Identity, que guarda solo un *hash* irreversible, bloquea tras intentos fallidos y genera los enlaces de un solo uso. No programamos criptografía propia, para no introducir errores.

**¿Qué prueba valida que nadie puede aprobarse a sí mismo?**
CP-34: un administrador crea una solicitud e intenta aprobarla desde la pantalla y llamando directo a la API. Resultado esperado: 403, la solicitud sigue pendiente y el intento queda registrado.

**¿Qué prueba valida la concurrencia entre servidores?**
CP-28: dos administradores modifican al mismo usuario desde dos instancias distintas al mismo tiempo. Una operación se aplica y la otra recibe 409.

**¿Cómo van a medir el rendimiento si no tienen los servidores del cliente?**
En el ambiente local, con escalones de 150, 300 y 600 consultas simultáneas. Informaremos la carga máxima que cumple la meta, y la compararemos con la producción cuando el cliente confirme los servidores y la frecuencia real de consultas.

**¿Qué ocurre si eliminamos la bitácora?**
Se pierde la necesidad N-06, saber quién concedió cada acceso, y con ella la respuesta ante auditorías, que era una de las consecuencias graves del diagnóstico.

**¿Qué no van a probar?**
El funcionamiento dentro de Citrix, porque no tenemos acceso. Lo declaramos como limitación y lo compensamos probando en Edge con la resolución mínima.
