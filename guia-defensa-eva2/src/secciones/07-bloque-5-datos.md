# Bloque 5 · Datos

**Diapositivas 13, 14 y 15 · Informe, secciones 7 y 8 · Criterio 2.1.4 (10 pts).**

## Qué Dominar

- Que el modelo se construye **sobre el esquema real que envió el profesor, con mejoras puntuales** (columnas agregadas, sin una capa paralela). Un **permiso** es un registro de `transaccion` (una opción dentro de una aplicación) y un **perfil** es un paquete de transacciones de varias aplicaciones. **Cada usuario tiene un solo perfil vigente** (`usuario.id_perfil`) y lo demás se resuelve con excepciones (`permiso_adiciona`).
- Las tablas principales y para qué sirven: `usuario` (identidad de AD y clave en *hash* en una sola tabla), `perfil` y `perfil_sistema_transaccion` (qué permisos da cada perfil), `permiso_adiciona` (excepciones), `solicitud_acceso` y `link_activacion` (activación), `importacion_ad` (sincronización) y `auditoria` (bitácora).
- Que existen un DER en 3 diagramas, un diccionario de datos y 10 reglas de integridad (RI-01 a RI-10).
- La **regla de propagación**: TI elige aplicar el cambio a todos o solo a algunos. «A todos» cambia la plantilla del perfil y queda registrado cada afectado; «a algunos» no toca la plantilla y crea una excepción por cada colaborador elegido. Todo en una sola transacción.
- La **definición de clonación**: se copia el perfil vigente de la referencia al destino (reemplaza el que tenía); las excepciones no se copian; si la referencia cambia después, el destino no cambia.
- Por qué Redis es no relacional y qué guarda: una ficha por persona con sus permisos, que se puede rehacer desde SQL.

## Frases Clave

> «SQL Server es la fuente de verdad; Redis es solo una copia rápida que se puede reconstruir.»

> «Nada cambia sin quedar en la bitácora: el cambio y su registro se guardan juntos o no se guarda nada.»

## Preguntas Probables

**¿Por qué este dato es relacional y este otro no?**
Perfiles, asignaciones y excepciones tienen relaciones, reglas de integridad e historial: necesitan SQL Server. La ficha de permisos por persona en Redis siempre se lee completa por una sola clave, sin cruzar tablas, y si se pierde se rehace. Guardarla también en SQL duplicaría datos.

**¿Qué necesidad justifica la tabla de permisos efectivos?**
N-04, no sobrecargar SQL Server, y N-07, responder lo mismo a las 37 aplicaciones. Es lo que entrega el endpoint, desde Redis o, si no está, desde SQL Server.

**¿Cómo cumplen «a todos o a algunos» si los perfiles no tienen versiones?**
El esquema real no versiona perfiles, así que no inventamos una tabla de versiones. «A todos» cambia la plantilla del perfil; «a algunos» crea una excepción igual para cada colaborador elegido. El resultado es el mismo que pidió el cliente.

**¿Por qué cada persona tiene un solo perfil?**
Porque así viene en el esquema real (`usuario.id_perfil`). Lo que alguien necesite fuera de su perfil se pide como excepción, con aprobación de otro administrador.

**¿Qué diferencia hay entre un perfil y un permiso?**
Un permiso es el acceso a una aplicación con una de sus opciones. Un perfil es un paquete de permisos de varias aplicaciones que corresponde a un puesto, por ejemplo «Operador de muelle». Cada persona tiene un perfil, no permisos sueltos; si necesita algo fuera de su perfil, se pide como excepción. El glosario está en la sección 1.1 del informe.

**¿Qué pasa si se clona y después cambia la persona de referencia?**
Nada en el destino: la clonación es una copia en un momento dado y queda registrada en la bitácora.

**¿Por qué no se copian las excepciones al clonar?**
Porque son permisos personales, aprobados para otra persona y con vencimiento. Si el destino necesita uno, se solicita como excepción nueva y pasa por aprobación.

**¿Cómo garantizan que la bitácora no se modifique?**
Con una tabla de SQL Server que solo permite agregar registros (*ledger append-only*). Si la versión del cliente no la tuviera, el plan B es quitar los permisos de modificar y borrar, y agregar un *trigger* que lo impida (RI-06).

**¿Qué pasa con las contraseñas actuales del legado?**
La columna antigua deja de usarse, pero antes debemos confirmar con el cliente que ninguna aplicación la use para autenticar (riesgo R-12).
