# Bloque 4 · Interfaces

**Diapositivas 11 y 12 · Informe, sección 6 · Criterio 2.1.3 (10 pts).**

## Qué Dominar

- El flujo de acceso de 5 pasos: solicita (solo si existe en el directorio) → otro administrador aprueba y asigna perfil → llega un enlace de un solo uso que vence a los 15 minutos (recomendación OWASP) → la persona crea su clave → entra según su rol.
- Las 8 pantallas, qué historia y qué requisito cubre cada una:

| Pantalla | Historias | Requisito |
| --- | --- | --- |
| Inicio de sesión y definir contraseña | HU13, HU15, HU17, HU18 | RF-13, RF-15, RF-16, RF-17 |
| Mis permisos | HU14 | RF-14 |
| Solicitudes de acceso | HU16 | RF-15 |
| Ficha del colaborador | HU01, HU10 | RF-02, RF-09 |
| Comparar y clonar | HU02, HU08 | RF-03 |
| Excepciones | HU03, HU09 | RF-04, RF-11 |
| Plantilla de perfil | HU07 | RF-01 |
| Bitácora | HU04 | RF-06 |

- Que cada flujo tiene **entrada → acción → validación → resultado → error**, y que hay 16 mensajes de error definidos.
- Los criterios para Citrix: resolución mínima de 1366 × 768, sin animaciones, tablas paginadas y uso completo con teclado.
- Que ocultar un botón es solo una ayuda: todo se valida en el servidor.

## Frases Clave

> «Diseñamos las pantallas desde las tareas del usuario, no desde las tablas de la base de datos.»

> «Un mismo login lleva al administrador a la administración y al colaborador a sus permisos.»

## Preguntas Probables

**¿Qué requerimiento cubre la pantalla de comparar y clonar?**
RF-03, con las historias HU02 (comparar) y HU08 (clonar). Atiende la necesidad N-02, eliminar la doble ventana.

**¿Qué pasa si el enlace del correo ya se usó o venció?**
Se muestra «este enlace ya no es válido» (ERR-15). Si el acceso ya estaba aprobado, la persona puede pedir otro sin una nueva aprobación.

**¿Por qué el mensaje de error del login no dice si falló el usuario o la contraseña?**
Para no darle pistas a quien intenta adivinar cuentas. Además, tras 5 intentos fallidos la cuenta se bloquea 15 minutos.

**¿Qué pasa si un colaborador cambia el identificador en la dirección para ver los permisos de otro?**
La API rechaza la solicitud con 403, porque toma la identidad de la sesión y no de lo que envía la pantalla (RNF-11, prueba CP-37).

**¿Las pantallas de aplicaciones, departamentos y recertificación?**
Quedan para la EVA 4. Tienen su flujo definido y reutilizan los mismos componentes (formulario y tabla).
