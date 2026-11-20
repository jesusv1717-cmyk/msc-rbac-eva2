# Integración del 20-11-2026: pull requests #2, #3 y #4

| PR | Autor | Qué entra | Ajustes al integrar |
| --- | --- | --- | --- |
| #2 | Sabrina | Sección 7 reescrita sobre el **esquema real** del profesor: cada usuario tiene **un solo perfil vigente**, los perfiles **no tienen versiones** («a todos» cambia la plantilla; «a algunos» crea excepciones) y se **eliminan los procedimientos legados** (las 37 aplicaciones consumen el endpoint). Diagramas nuevos y un escenario por lámina en el bloque 3. | Los wireframes de la ficha, la clonación, la plantilla y Mis permisos se corrigieron para mostrar un solo perfil y sin versiones; también el diagrama de flujo de la clonación. En la presentación: MVP sin «No modificar las 37 aplicaciones», hito 3 «vista personal y migración», lámina de Datos con «un perfil vigente» y cierre con la migración como pendiente. |
| #4 | Pablo | Nombres por rol en la sección 3 y descarte de *Trunk-Based Development*. | Conflictos con el #2 resueltos. El estándar EST-01 **no se borró**: ahora describe el flujo real (*fork* y *pull request* revisado por otro integrante), así no se rompen las referencias EST-xx. La lámina de roles muestra los nombres. |
| #3 | bloque 5 | Lámina de Datos con catálogo de aplicaciones y aprobación de excepciones; lámina de Redis con meta < 20 ms y origen de las cifras; **lámina nueva con el video** de Redis. | El video no cargaba por la ruta `/redis-simulador-corto.mp4`: pasó a `src/assets/video/` con ruta relativa, alto limitado y una **portada** para que se vea en el PDF y la PPTX. La lámina de Datos se alineó al modelo del #2. |

La presentación pasa de 16 a 19 láminas (bloque 4 = láminas 11 y 12). La guía de defensa y el guion del bloque 4 se alinearon al modelo nuevo y a la nueva numeración.

**Para revisar en grupo:** la Figura 23 (DER del esquema real) se ve pequeña en el PDF; y la eliminación de los procedimientos legados cambia lo que se dijo en la EVA 1, así que conviene tener clara la respuesta (guía, bloque 3).

---

# Cambios al informe EVA 2: coherencia y redundancias

Archivo: `entregables/Informe-EVA2-G07.pdf` (70 páginas) y `entregables/Informe-EVA2-G07.docx`.
Solo se aplicaron los tres cambios que acordó el grupo. **No se tocó la estructura del DER ni la arquitectura**: eso queda para cuando lleguen el ER nuevo de Sabrina y la decisión de arquitectura sobre las opciones de Catalina.

## 1. Vocabulario: se elimina «cargo», el estándar es «perfil»

| Antes | Ahora |
| --- | --- |
| **Cargo**: paquete de accesos que se asigna a una persona | **Perfil** |
| **Perfil** (de un sistema): acceso a una aplicación | **Permiso** |
| «Asignar perfiles» (se asignaban sueltos) | «Asignar perfiles» = asignar el paquete completo, no permisos sueltos |
| Tablas `cargo`, `cargo_version`, `cargo_version_perfil`, `asignacion_cargo` | `perfil`, `perfil_version`, `perfil_version_permiso`, `asignacion_perfil` (DER, tablas de la sección 7 y diagramas) |
| Evento `ASIGNAR_CARGO` | `ASIGNAR_PERFIL` |
| Menú «Cargos» en los wireframes | Menú «Perfiles» (wireframe de la plantilla: `w04-plantilla-perfil`) |

Además:

- **Nuevo glosario** en la sección 1.1 «Términos Usados en este Informe». Define Aplicación, Permiso, Perfil, Excepción, Colaborador, Cuenta y Rol del portal, y aclara que un rol del portal no es un perfil.
- **Introducción de la sección 7 reescrita**: explica que en el legado cada opción de acceso de una aplicación (`tb_perfil`) se llama ahora **permiso**, y que el **perfil** es el paquete nuevo. Los nombres de las tablas legadas se mantienen porque los satélites dependen de ellos.
- Frases que quedaron raras tras el cambio:
  - Sección 1, actores: antes «asigna perfiles, clona perfiles»; ahora «asigna perfiles, copia los perfiles de un colaborador a otro».
  - Sección 2, MVP: antes «asigna permisos por perfil, compara y clona perfiles»; ahora «asigna perfiles en vez de permisos sueltos, compara y copia los perfiles de un colaborador a otro».
  - HU07: antes «la plantilla de permisos de cada perfil»; ahora «los permisos que incluye cada perfil».
  - Matriz de la sección 9: antes «Asignar permisos por perfil»; ahora «Asignar perfiles».

## 2. El enlace por correo vence a los 15 minutos (OWASP), no a las 24 horas

| Dónde | Antes | Ahora |
| --- | --- | --- |
| Sección 2, criterios de HU17 y HU18 | vence en 24 horas | vence a los 15 minutos |
| Sección 5, tabla de configuración | 24 horas | 15 minutos (recomendación OWASP) |
| Sección 7, `enlace_un_uso.expira_en` | Vence a las 24 horas | Vence a los 15 minutos |
| Sección 9, controles de enlaces | vencen a las 24 horas | vencen a los 15 minutos, como recomienda OWASP (cita ASVS, que ya estaba en las referencias) |
| Sección 9, riesgo residual | El vencimiento de 24 horas… | El vencimiento a los 15 minutos… Si la persona no alcanza a usarlo, se reenvía sin una nueva aprobación |
| Sección 11, riesgo R-14 | 24 horas de vigencia | 15 minutos de vigencia |
| Wireframe de inicio de sesión | vence en 24 horas | vence en 15 minutos |

## 3. Se elimina el rol Auditor

| Dónde | Antes | Ahora |
| --- | --- | --- |
| Sección 1, actores | «con dos cambios», el segundo era el Auditor; también había una fila Auditor en la tabla | «con un cambio» (el colaborador pasa a usuario directo); sin fila Auditor |
| Sección 1, tabla de cambios | Administrador TI, Colaborador y Auditor | Administrador TI y Colaborador, más roles técnicos |
| Sección 2, HU04 | «Como Auditor o Administrador TI…»; N-06 y N-09 | «Como Administrador TI…»; N-06 |
| Sección 6, intro | tres experiencias según el rol | dos experiencias (Administrador TI y Colaborador) |
| Sección 6, bitácora (Fig. 15) | el wireframe mostraba la vista del Auditor (`pmunoz`) | vista del Administrador TI (`rsalas`) con el menú completo |
| Sección 7, columna `rol` | `ADMINISTRADOR_TI`, `COLABORADOR` o `AUDITOR` | `ADMINISTRADOR_TI` o `COLABORADOR` |
| Sección 7, reglas de integridad | RI-01 a RI-11 | RI-01 a RI-10 (se elimina RI-11, «no ser Administrador y Auditor a la vez») |
| Sección 9, tabla de roles | tres roles para personas | dos roles para personas, definidos por el cliente el 14-11 |
| Sección 9, separación de funciones | cuatro reglas (la cuarta era la independencia del Auditor) | tres reglas; la tercera queda «Nadie se otorga a sí mismo el rol de Administrador TI» |
| Sección 9, matriz de permisos | columna Auditor y nota ¹ sobre su contraseña | sin esa columna; notas renumeradas: ¹ nunca sobre algo que él mismo creó, ² nunca sobre sí mismo |
| Sección 9, gobierno de la auditoría | la leen los administradores y el Auditor | la leen los Administradores TI; ningún rol puede modificarla ni borrarla |
| Sección 10, plan de pruebas | CP-01 a CP-53 | CP-01 a CP-51 (se eliminan CP-52 y CP-53, que eran del Auditor) |
| Sección 11, trazabilidad de HU04 | Auditor…; RI-11; CP-52, CP-53 | Administrador TI en solo lectura; sin RI-11 ni CP-52/53 |
| Anexo B, entrevista | fila «Rol Auditor (conversación posterior)» | eliminada |

## Puntos para que el grupo valide

1. **¿Les sirve el glosario de la sección 1.1?** Lo agregué para que el profesor vea que cada término tiene un solo significado.
2. **«Clonar permisos»** (matriz de la sección 9) y **«Comparar y clonar permisos»** (título del wireframe de la Fig. 12): la clonación copia **perfiles**, no permisos sueltos. Los dejé tal cual porque la matriz es la que acordó el equipo. ¿Los cambiamos a «Clonar perfiles»?
3. Sección 9: antes decía que el rol de administrador lo asigna «un Administrador TI»; ahora dice **«otro» Administrador TI**, para que calce con la regla 3. Revisen que les parezca bien.

## Lo que todavía falta (no se tocó)

- **ER nuevo de Sabrina**: cuando llegue, se cambia la sección 7 y sus tres diagramas.
- **Arquitectura**: falta decidir entre las opciones de Catalina.
- **Bloque 5 de Catalina**: su versión todavía no está integrada al deck (más abajo se explica qué falta).

## Material de la defensa alineado con estos cambios

| Archivo | Qué cambió |
| --- | --- |
| Presentación (`entregables/Presentacion-EVA2-G07.pdf` y `.pptx`) | Las láminas y las notas usan «perfil» en vez de «cargo». Lámina 9: «De un solo uso, 15 min». Lámina 13: sin la tarjeta del Auditor; dos roles. Láminas 1 y 14: 51 casos (16 de seguridad, ya no 18). Se actualizaron los wireframes de las láminas 9 y 10. |
| Guía de defensa (`entregables/Guia-Defensa-EVA2.pdf`, 18 págs.) | Mismos cambios. En el bloque 5 se agrega la pregunta «¿Qué diferencia hay entre un perfil y un permiso?». En el bloque 6, las dos preguntas del Auditor se reemplazan por «¿Quién revisa la bitácora?» y «¿Por qué el enlace vence a los 15 minutos?». |
| Guion del bloque 4 (`entregables/Guion-Bloque4-Interfaces.pdf`, 14 págs.) | Mismos cambios, con las láminas 9 y 10 nuevas. La pregunta «¿Qué ve el Auditor?» se reemplaza por «¿Qué diferencia hay entre perfil y permiso en estas pantallas?». |

**Sobre la versión de Catalina** (`presentacion-eva2-bloque5.pptx`):
- Sus láminas 11 y 12 ya usan «perfil».
- Sus **notas del orador** vienen del deck antiguo y todavía dicen «cargo», «Auditor», «24 h» y «53 casos». Las notas corregidas están en el deck nuevo.
- En el deck nuevo **no** están sus agregados: las 4 tarjetas de cifras de la lámina 12, la frase «Si TI cambia un perfil, se borran las fichas…» y el video del simulador de Redis. Cuando ella cierre su versión, se integran sobre el deck nuevo.
