# MSC-01 · Modernización del sistema RBAC de MSC Chile — EVA 2

Proyecto Integrado (TIHV43) · Grupo G07 «LCS SpA» · Docente: Edgar López.

Este repositorio reúne **la última versión** del material de la EVA 2: el informe de diseño, la presentación de la defensa, la guía de estudio y el guion del bloque 4. Todo se escribe en Markdown con los templates INACAP de Sabrina y se genera en PDF, DOCX o PPTX.

## Ver los documentos sin instalar nada

Están en la carpeta [`entregables/`](entregables/):

| Archivo | Qué es |
| --- | --- |
| `Informe-EVA2-G07.pdf` / `.docx` | Informe de diseño (versión oficial) |
| `Presentacion-EVA2-G07.pdf` / `.pptx` | Presentación de la defensa (la PPTX trae las notas del orador) |
| `Guia-Defensa-EVA2.pdf` | Guía de estudio por bloque, con preguntas probables |
| `Guion-Bloque4-Interfaces.pdf` | Guion del bloque 4 (interfaces) |
| `Simulacion-Redis.mp4` | Video de la lámina 15 (en el PDF y la PPTX se ve solo su portada) |

Los cambios más recientes (integración de los pull requests #2, #3 y #4, y antes: perfil en vez de cargo, enlace de 15 minutos y sin rol Auditor) están explicados en [`CAMBIOS.md`](CAMBIOS.md).

## Estructura

```
msc-rbac-eva2/
├─ entregables/          # PDF, DOCX y PPTX ya generados
├─ informe-eva2/         # Informe (template de informes INACAP)
│  ├─ src/secciones/     #   una sección por archivo .md  ← aquí se edita el texto
│  ├─ src/diagramas/     #   diagramas Mermaid (.mmd)
│  └─ src/wireframes/    #   wireframes en HTML
├─ presentacion-eva2/    # Presentación (template Slidev)
│  └─ src/slides.md      #   todas las diapositivas y sus notas  ← aquí se edita
├─ guia-defensa-eva2/    # Guía de estudio (template de informes)
├─ guion-bloque4/        # Guion del bloque 4 (template de informes)
└─ CAMBIOS.md            # Resumen antes → después de la última corrección
```

## Cómo generar los documentos

Requisitos (una sola vez): [Node.js 22 o superior](https://nodejs.org) y pnpm (`npm i -g pnpm`). Para el PDF se usa Microsoft Edge, que ya viene en Windows.

Dentro de la carpeta que quieras generar:

```powershell
pnpm install
```

| Carpeta | Ver en vivo mientras editas | Generar |
| --- | --- | --- |
| `informe-eva2`, `guia-defensa-eva2`, `guion-bloque4` | `pnpm start` (abre `http://localhost:3000`) | `pnpm build` → PDF y DOCX en `.reports/` |
| `presentacion-eva2` | `pnpm dev` (abre `http://localhost:3030`; notas en `/presenter`) | `pnpm export` → PDF en `.reports/` |

En el informe, si cambias un wireframe (`src/wireframes/*.html`), corre `pnpm wireframes` antes de `pnpm build`. Los diagramas Mermaid se regeneran solos al compilar.

## Cómo colaborar (fork + pull request)

Así cada integrante trabaja en su copia y los cambios llegan a la versión oficial solo después de revisarlos.

**La primera vez:**

1. Inicia sesión en GitHub y abre este repositorio.
2. Presiona **Fork** (arriba a la derecha) y luego **Create fork**. Te queda una copia en tu cuenta.
3. Descarga tu copia a tu computador:
   - Con **GitHub Desktop**: *File → Clone repository*, elige tu fork.
   - Con la terminal: `git clone https://github.com/<tu-usuario>/msc-rbac-eva2.git`

**Cada vez que hagas un cambio:**

1. Antes de empezar, en la página de tu fork presiona **Sync fork → Update branch** para traer lo último.
2. Edita los archivos `.md` (texto) en tu computador.
3. Guarda el cambio (*commit*) con un mensaje claro, por ejemplo `fix(informe): corrige DER de la sección 7`, y súbelo (*push*) a tu fork.
4. En GitHub, en tu fork, presiona **Contribute → Open pull request** y explica qué cambiaste y por qué.
5. Jesús (u otro integrante) revisa el *pull request* y lo acepta (*merge*).

**Reglas del grupo:**

- Cambia **solo lo acordado** y explícalo en el *pull request*; así se revisa línea por línea y nadie reescribe el informe completo.
- Edita los `.md`, no los PDF: los PDF de `entregables/` se regeneran después de aceptar los cambios.
- Usa el vocabulario del glosario (sección 1.1 del informe): **perfil** es el paquete de permisos de un puesto, **permiso** es el acceso a una aplicación.

## Pendiente

- Confirmar con el cliente cómo migra cada una de las 37 aplicaciones al endpoint (riesgo R-15).
- Fechas de los sprints y de la EVA 3 y la EVA 4 (sección 3).
- Línea base de tiempos (Anexo A) y entrevista a RRHH.
- Qué guarda hoy `usuario.password_hash` y dónde se guardan los adjuntos de las excepciones (sección 7, brechas).
