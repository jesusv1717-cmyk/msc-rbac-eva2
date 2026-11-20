# Bloque 3 · Arquitectura e Infraestructura

**Diapositivas 6 a 10 · Informe, secciones 4 y 5 · Criterio 2.1.2 (15 pts, el de mayor puntaje del informe).**

## Qué Dominar

- Qué es el modelo 4+1 en una frase por vista: **lógica** (qué hace cada parte), **desarrollo** (cómo se organiza el código), **procesos** (qué pasa en ejecución y en paralelo), **física** (dónde corre) y **+1** (escenarios que las recorren).
- Por qué una sola aplicación (monolito modular) y no microservicios.
- La **proyección de permisos**: se calculan cuando algo cambia y se dejan listos, en vez de calcularlos en cada consulta. Esto descarga SQL Server sin tocar las 37 aplicaciones.
- La vista física: varios servidores IIS con balanceo ARR, SQL Server de MSC, Redis, correo y la API de AD.
- Cómo se resuelve la concurrencia entre servidores: **bloqueo de fila** dentro de la transacción y verificación de versión.
- Los 4 escenarios y algunos de los 15 casos borde.
- Por qué no hay contraseñas en el código sin Key Vault: cuenta de servicio de Windows (gMSA).

## Frases Clave

> «La base de datos es el único punto común entre los servidores; por eso la concurrencia se controla ahí.»

> «La pregunta y la respuesta siguen siendo las mismas, pero sobre una base más robusta.»

## Preguntas Probables

**¿Por qué eligieron esta arquitectura y qué alternativa descartaron?**
Una aplicación ordenada por módulos, porque es lo que un equipo de seis puede construir, probar y defender en un semestre. Descartamos los microservicios por el costo de desplegar y monitorear varios servicios. Todas las decisiones y sus alternativas están en la tabla D-01 a D-11.

**¿Qué pasa si dos administradores dan y quitan el mismo permiso al mismo tiempo, en servidores distintos?**
La primera operación bloquea la fila de esa persona en la base. La segunda espera, y cuando obtiene la fila ve que su versión cambió: se cancela y el administrador recibe «otro administrador modificó este usuario, recargue». Evaluamos la cola FIFO en Redis que sugirió el profesor, pero el bloqueo de fila resuelve lo mismo con menos piezas (D-09).

**¿Eso no repite el bloqueo del sistema actual?**
No. El legado bloqueaba el registro mientras alguien tenía la pantalla abierta, y quedaba tomado si se cerraba la aplicación. El nuestro dura solo lo que dura la transacción, milisegundos.

**¿Qué pasa si se cae un servidor IIS?**
El balanceador envía las solicitudes al otro y la sesión sigue válida, porque las llaves de sesión se comparten entre servidores. Una operación que estaba a medias se revierte completa.

**¿Qué pasa si Redis se cae?**
La aplicación espera como máximo 50 ms, lee desde SQL Server y responde igual, solo más lento, y avisa a TI. Las aplicaciones reciben la misma respuesta, sin errores.

**¿Por qué las aplicaciones consultan un endpoint y no la base de datos?**
Porque así una sola pieza resuelve los permisos, con caché, y la base deja de recibir las consultas de las 37 aplicaciones. Se eliminan los procedimientos y vistas legados (D-06 y D-08). Cada aplicación tiene que migrar al endpoint, y eso se está conversando con el cliente aplicación por aplicación (riesgo R-15).

**¿Por qué React y no Blazor, si el cliente exige C# y .NET?**
La exigencia se cumple en el backend y la base de datos. Blazor Server mantiene una conexión permanente por usuario, sensible a las reconexiones de Citrix, y Blazor WebAssembly descarga todo el entorno al navegador, lo que consume memoria en cada sesión (D-02).
