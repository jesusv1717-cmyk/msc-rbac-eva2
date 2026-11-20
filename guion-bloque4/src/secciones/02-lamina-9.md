# Lámina 11 · Cómo Entra una Persona al Sistema

![Lámina 11 de la presentación: flujo de acceso en cinco pasos y wireframe de inicio de sesión](assets/laminas/9.png "Figura 1. Lámina 11 de la presentación de la defensa. Fuente: Elaboración propia (2026).")

## Lo que Dicen las Notas del PowerPoint

> «Las pantallas las diseñamos a partir de las tareas reales. Esta es la entrada al sistema. La persona pide acceso, pero solo si ya existe en el directorio de la empresa. Un administrador distinto de quien creó la solicitud la aprueba y le asigna su perfil en el mismo paso. Le llega un enlace que sirve una sola vez y vence a los 15 minutos, como recomienda OWASP; crea su propia contraseña, y entra a la parte que le corresponde según su rol. Así resolvemos lo que el cliente no quería repetir: la contraseña ya no se ve, ya no es nombre.apellido, y nadie de TI la conoce.»

## Guion para Decir

**Apertura (tomando el pase del bloque 3):**

> «Gracias. Ahora vamos a ver cómo se ve todo esto para las personas que lo usan. Las pantallas las diseñamos a partir de las tareas reales de cada usuario, no a partir de las tablas de la base de datos. Partimos por la más básica: cómo entra una persona al sistema.»

**Los cinco pasos** (señala cada tarjeta de izquierda a derecha):

> «Primero, la persona **solicita acceso** desde la misma pantalla de inicio de sesión. Pero solo puede hacerlo si ya existe en el directorio corporativo de la empresa; nadie puede inventarse una identidad.
>
> Segundo, **un administrador aprueba** la solicitud y, en el mismo paso, le asigna su perfil inicial, es decir, el paquete de permisos que corresponde a su puesto. Y aquí hay una regla importante: quien aprueba no puede ser la misma persona que creó la solicitud.
>
> Tercero, a la persona **le llega un enlace** a su correo corporativo. Ese enlace sirve una sola vez y vence a los 15 minutos, como recomienda OWASP.
>
> Cuarto, con ese enlace **crea su propia contraseña**. TI nunca la ve ni la conoce.
>
> Y quinto, **entra al sistema**, y según su rol llega a una página distinta: el administrador a la administración y el colaborador a sus permisos.»

**Cierre de la lámina** (señala las tres tarjetas de la derecha):

> «Con este flujo resolvemos algo que el cliente nos pidió explícitamente no repetir: hoy la contraseña se ve en pantalla y suele ser nombre.apellido. Además cuidamos los casos de error. Si alguien se equivoca, el mensaje no dice si falló el usuario o la contraseña, para no dar pistas. Después de 5 intentos fallidos, la cuenta se bloquea 15 minutos. Y si el enlace venció, se puede pedir otro sin volver a aprobar.»

> **Señala en la lámina:** las cinco tarjetas en orden; luego, en el wireframe, el recuadro punteado con el error de inicio de sesión (①), el botón «Solicitar acceso» (②) y el mensaje «Este enlace ya fue usado o venció» (③).

## Explicación Adicional

**Qué requerimientos cubre esta lámina.** Si el profesor pregunta, esta es la respuesta exacta:

| Paso | Historia | Requerimiento | Error asociado |
| --- | --- | --- | --- |
| Iniciar sesión | HU13 | RF-13 | ERR-13 (credenciales incorrectas), ERR-14 (cuenta bloqueada) |
| Solicitar acceso | HU15 | RF-15 | ERR-01 (no existe en el directorio) |
| Aprobar la solicitud | HU16 | RF-15 | ERR-04 (aprobar algo propio) |
| Definir la contraseña | HU17 | RF-16 | ERR-15 (enlace vencido o usado), ERR-16 (contraseña débil) |
| Recuperar la contraseña | HU18 | RF-17 | — (la respuesta es siempre la misma) |

Fuente: Elaboración propia a partir de las secciones 2 y 6 del informe (2026).

**Por qué cada decisión** (el profesor puede preguntar el «¿por qué?» de cualquiera):

- **Solo pide acceso quien existe en el directorio:** porque las identidades vienen de AD. Así nadie puede crear una cuenta para una persona que no trabaja en la empresa. Por eso esta solicitud no es el «autoservicio» que se excluyó en la EVA 1: no crea identidades ni otorga permisos.
- **Aprueba otro administrador:** es la separación de funciones que pidió la retroalimentación (CAL-07). Si una sola persona pudiera crear y aprobar, podría darse acceso a sí misma o a un tercero sin que nadie lo revise.
- **Se asigna el perfil al aprobar:** así la persona entra con sus permisos listos, sin un segundo trámite.
- **Enlace en vez de contraseña por correo:** al principio se pensó en enviar una contraseña autogenerada (lo sugirió el profesor). El enlace es todavía más seguro, porque ninguna contraseña real viaja por correo y nadie de TI la conoce (decisión D-10).
- **15 minutos y un solo uso:** es lo que recomienda OWASP y limita al mínimo el tiempo en que un enlace robado sirve. Si la persona no alcanza a usarlo, pide otro sin una nueva aprobación. Al pedir uno nuevo, los anteriores se invalidan, y al definir la contraseña se cierran las sesiones abiertas.
- **Mensaje de error genérico:** si el sistema dijera «el usuario no existe», un atacante sabría qué usuarios sí existen. Por la misma razón, la recuperación de contraseña responde igual exista o no la cuenta.
- **Bloqueo tras 5 intentos:** frena a quien intenta adivinar contraseñas (fuerza bruta). Cada intento fallido queda en la bitácora.
- **Política de contraseñas:** mínimo 12 caracteres y se rechazan las más comunes y las que contienen el usuario o el nombre, como el antiguo «nombre.apellido».
- **Página según el rol:** un mismo inicio de sesión, como describió el cliente. Ocultar menús es solo ayuda visual: la API verifica el rol en cada solicitud.

**Dato para lucirse:** las contraseñas se guardan con ASP.NET Core Identity, que usa un *hash* irreversible (PBKDF2). No programamos criptografía propia, para no introducir errores.
