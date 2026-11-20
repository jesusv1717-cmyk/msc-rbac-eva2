# Bloque 1 · Contexto y Alcance

**Diapositivas 2 y 3 · Informe, secciones 1 y 2 · Criterio de calidad y coherencia.**

## Qué Dominar

- Las cuatro causas del problema: permisos uno por uno, la «doble ventana», la pérdida del dato de departamento tras pasar a Entra ID y la sobrecarga de SQL Server. Más el quinto problema que vimos en el código: contraseñas visibles y fáciles de adivinar.
- Los cinco cambios que salieron de la entrevista del 14-11 y que **ninguno recorta el alcance**.
- El MVP en una frase, sin leerlo.
- Qué entra al MVP, qué queda para la EVA 4 (aplicaciones, departamentos y recertificación) y qué no haremos (*Won't Have*).
- Que las necesidades están numeradas (N-01 a N-11) para que la trazabilidad se pueda auditar.

## Frases Clave

> «El alcance aprobado no se recortó: solo ordenamos qué se construye primero.»

> «Lo que queda para la EVA 4 ya está diseñado completo; no bloquea a nada del MVP.»

## Preguntas Probables

**¿Por qué dejaron departamentos y recertificación fuera del MVP? ¿Eso no es recortar?**
No se recorta, porque ambas están diseñadas completas en el informe y se construyen para la EVA 4. Salen del MVP porque ninguna bloquea a las demás: los departamentos se cargan como datos de partida y la recertificación necesita que ya existan asignaciones y bajas funcionando.

**¿Qué pasa si eliminamos la vista «Mis permisos»?**
Se deja de cubrir la necesidad N-10, que pidió el cliente: cada persona tendría que preguntarle a TI qué accesos tiene, y TI seguiría recibiendo esas consultas.

**¿El portal no es un «autoservicio», que estaba excluido?**
No. El colaborador solo ve lo suyo y solo puede pedir acceso si ya existe en el directorio de la empresa; nunca se otorga permisos. La exclusión de la EVA 1 se mantiene.

**¿Cuál es la necesidad más importante del cliente y qué la resuelve?**
Eliminar la doble ventana (N-02). La resuelve la pantalla de comparar y clonar, que copia el perfil de una persona a otra en un solo paso.
