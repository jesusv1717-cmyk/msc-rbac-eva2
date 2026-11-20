# Bloque 2 · Planificación y Equipo

**Diapositivas 4 y 5 · Informe, secciones 3 y 9 (roles del equipo) · Criterio 2.1.1 (10 pts).**

## Qué Dominar

- Los 4 hitos, su orden y **por qué** van en ese orden: sin cuentas no hay acceso; sin perfiles no hay nada que asignar ni copiar.
- La prueba de cierre de cada hito.
- Que hay 28 tareas con responsable, dependencias y sprint, y cuál es la cadena crítica (esquema → cuentas → acceso, y esquema → perfiles → asignación → clonación).
- La *Definition of Done*: revisado por otro integrante, criterios verificados, pruebas en verde, sin secretos en el código y trazabilidad actualizada.
- Los 6 roles del equipo, quién lleva cada uno y qué estándares verifica.
- Los estándares de Git y de código (EST-01 a EST-06).

## Frases Clave

> «Cada hito agrupa los requisitos más importantes y termina con una prueba de punta a punta.»

> «Nadie, ni siquiera quien administra el repositorio, sube código sin que otro integrante lo revise.»

## Preguntas Probables

**¿Por qué el hito 1 es el acceso y no los permisos, que son el corazón del problema?**
Porque todo depende de que existan cuentas y sesiones. Sin poder ingresar, no se puede asignar, clonar ni probar nada más.

**¿Qué pasa si una tarea de la cadena crítica se atrasa?**
Se atrasan las que dependen de ella. Por eso las tareas críticas se trabajan en pareja, hay revisión a mitad de sprint y el riesgo está declarado (R-03 y R-04).

**¿Cómo saben que una tarea está terminada?**
Cuando cumple las cinco condiciones de la *Definition of Done*. La más importante es que la revisó un integrante distinto del autor.

**¿Qué estándares de programación aplican?**
Ramas cortas por tarea, nadie sube directo a la rama principal, revisión obligatoria, mensajes de commit estándar, convenciones de C#, TypeScript y SQL, y un pipeline que bloquea pruebas fallidas y contraseñas escritas en el código.

**¿Quién lleva cada rol?**
Arquitectura y Backend, Sabrina; Frontend y UI/UX, Pablo; Base de Datos y Rendimiento, Abraham; Requerimientos y Trazabilidad, Jesús; Ciberseguridad, Catalina; Scrum, DevOps y QA, José (informe, sección 3).

**¿Cómo trabajan con Git?**
Cada integrante trabaja en su *fork* y propone sus cambios con un *pull request*; otro integrante lo revisa antes de fusionarlo (EST-01).

**¿Por qué faltan las fechas de los sprints?**
Porque todavía no tenemos las fechas oficiales de la EVA 3 y la EVA 4. El orden, la duración (dos semanas) y las dependencias ya están definidos.
