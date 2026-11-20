---
theme: default
themeConfig:
  brand: red
title: Diseño de la Solución — RBAC MSC Chile | Evaluación 2
info: |
  ## Diseño de la solución de software — RBAC MSC Chile
  Evaluación 2 · Proyecto Integrado (TIHV43) · INACAP.
  Docente: Edgar López.
author: Pablo Herrera, Jesús Rincón, Sabrina Silva, Abraham Tapia, Catalina Cubillos, José Morales
keywords: rbac,msc,diseño,arquitectura,inacap,eva2
fonts:
  sans: INACAP Nueva Sans
  serif: INACAP Nueva Serif
  provider: none
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
colorSchema: light
class: text-left
---

<div class="flex-between items-center mb-3">
  <div class="eyebrow">Proyecto Integrado · TIHV43 · Evaluación 2</div>
  <span class="chip bg-brand-red/10 text-xs font-semibold text-brand-red-dark border border-brand-red/20 flex items-center gap-1.5">
    <div class="i-mdi-ship-wheel text-sm shrink-0" />
    <span>Grupo G07 · MSC-01</span>
  </span>
</div>

# Diseño de la Solución <span class="brand-gradient brand-gradient-flow">RBAC MSC Chile</span>

<p class="mt-2 text-base text-ink/80 font-medium">De lo que el cliente necesita a un sistema que se puede construir</p>

<div class="mt-4 grid grid-cols-4 gap-3">
  <div class="card p-3 border-l-4 border-brand-red">
    <div class="flex items-center justify-between text-brand-red"><span class="text-2xl font-extrabold">19</span><div class="i-mdi-card-text-outline text-xl opacity-80" /></div>
    <div class="text-xs font-semibold text-ink-soft mt-1">Historias de usuario</div>
  </div>
  <div class="card p-3 border-l-4 border-brand-navy">
    <div class="flex items-center justify-between text-brand-navy"><span class="text-2xl font-extrabold">4</span><div class="i-mdi-flag-checkered text-xl opacity-80" /></div>
    <div class="text-xs font-semibold text-ink-soft mt-1">Hitos hasta la EVA 3</div>
  </div>
  <div class="card p-3 border-l-4 border-brand-crimson">
    <div class="flex items-center justify-between text-brand-crimson"><span class="text-2xl font-extrabold">8</span><div class="i-mdi-monitor-dashboard text-xl opacity-80" /></div>
    <div class="text-xs font-semibold text-ink-soft mt-1">Pantallas diseñadas</div>
  </div>
  <div class="card p-3 border-l-4 border-brand-red">
    <div class="flex items-center justify-between text-brand-red"><span class="text-2xl font-extrabold">51</span><div class="i-mdi-check-decagram-outline text-xl opacity-80" /></div>
    <div class="text-xs font-semibold text-ink-soft mt-1">Casos de prueba</div>
  </div>
</div>

<div class="mt-5 grid grid-cols-2 gap-3 text-xs">
  <div class="card p-3">
    <div class="font-bold text-brand-red-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-account-group text-base shrink-0" /><span>Equipo</span></div>
    <div class="text-ink/80 leading-relaxed">Pablo Herrera · Jesús Rincón · Sabrina Silva<br />Abraham Tapia · Catalina Cubillos · José Morales</div>
  </div>
  <div class="card p-3">
    <div class="font-bold text-brand-navy-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-school text-base shrink-0" /><span>Datos académicos</span></div>
    <div class="text-ink/80 leading-relaxed"><b>Asignatura:</b> Proyecto Integrado (TIHV43)<br /><b>Docente:</b> Profesor Edgar López · <b>Fecha:</b> 17-11-2026</div>
  </div>
</div>

<!--
Guion (apertura, quien abre la presentación):
"Buenos días, profesor. En la EVA 1 diagnosticamos el problema del sistema de permisos de MSC Chile. Hoy venimos a mostrar cómo lo vamos a resolver: el diseño completo de la solución. Lo organizamos en seis bloques: contexto, plan de trabajo, arquitectura, pantallas, datos, y seguridad con pruebas. Todo lo que van a ver se puede rastrear hasta una necesidad del cliente."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 1 · Contexto y alcance</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-account-voice mr-1 text-brand-red" /> Entrevista 14-11</span>
</div>

# <span class="i-mdi-alert-circle-outline align-middle mr-2 text-brand-red" /> El problema y lo que aprendimos del cliente

<div class="grid grid-cols-2 gap-4 mt-3 text-sm">

<div class="card p-4 border-t-3 border-brand-red">
  <div class="font-bold text-brand-red-dark mb-2 flex items-center gap-1.5"><div class="i-mdi-close-octagon-outline" /> Hoy</div>
  <ul class="text-xs leading-relaxed text-ink/85 space-y-1.5">
    <li>Los permisos se asignan <b>uno por uno</b>, aplicación por aplicación.</li>
    <li>Para copiar los permisos de un compañero se abren <b>dos ventanas</b> y se compara a ojo.</li>
    <li>Las contraseñas se pueden <b>ver en pantalla</b> y suelen ser «nombre.apellido».</li>
    <li>Las <b>37 aplicaciones</b> consultan los permisos a la base de datos y la sobrecargan.</li>
  </ul>
</div>

<div class="card p-4 border-t-3 border-brand-navy">
  <div class="font-bold text-brand-navy-dark mb-2 flex items-center gap-1.5"><div class="i-mdi-lightbulb-on-outline" /> Lo que cambió tras la entrevista</div>
  <ul class="text-xs leading-relaxed text-ink/85 space-y-1.5">
    <li><b>Login propio</b> con usuario y contraseña, sin depender de Microsoft.</li>
    <li>Cada colaborador puede <b>ver sus propios permisos</b>.</li>
    <li>Un cambio de perfil se aplica a <b>todos o solo a algunos</b>.</li>
    <li>Quien sale de la empresa pierde el acceso <b>en 10 minutos o menos</b>.</li>
    <li>Corre en <b>varios servidores</b>, así que cuidamos lo que pasa si dos personas actúan a la vez.</li>
  </ul>
</div>

</div>

<div class="mt-3 text-xs text-ink-soft flex items-center gap-1.5"><div class="i-mdi-information-outline" /> Todo cambio respecto de la EVA 1 está declarado y justificado en la sección 1.4 del informe.</div>

<!--
Guion (Bloque 1):
"El problema sigue siendo el mismo de la EVA 1: los permisos se asignan a mano, uno por uno, y para copiar los accesos de un compañero el soporte abre dos ventanas y compara casilla por casilla. Además, al revisar el sistema actual vimos que las contraseñas se ven en pantalla.
Después conversamos de nuevo con el cliente y eso cambió cinco cosas del diseño, que aparecen a la derecha. La más importante: el login ahora es propio y cada persona puede ver sus permisos. Ninguno de estos cambios recorta el alcance aprobado; todos están declarados en el informe."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 1 · Contexto y alcance</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-target mr-1 text-brand-red" /> MVP</span>
</div>

# <span class="i-mdi-bullseye-arrow align-middle mr-2 text-brand-red" /> El MVP en una frase

<div class="card p-3 mt-2 border-l-4 border-brand-red text-sm text-ink/90 italic">
  «Un portal donde TI aprueba accesos, asigna perfiles en vez de permisos sueltos, copia los perfiles de una persona a otra en una sola pantalla y gestiona excepciones aprobadas por otro administrador; cada colaborador ve sus permisos, y todo queda registrado sin romper las 37 aplicaciones.»
</div>

<div class="grid grid-cols-3 gap-3 mt-4 text-xs">
  <div class="card p-3 border-t-3 border-brand-red">
    <div class="font-bold text-brand-red-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-check-circle-outline" /> Entra al MVP (EVA 3)</div>
    <ul class="leading-relaxed text-ink/85 space-y-1">
      <li>Login, solicitud de acceso y contraseñas</li>
      <li>Perfiles, clonación y excepciones</li>
      <li>«Mis permisos» del colaborador</li>
      <li>Bitácora y conexión con las 37 apps</li>
    </ul>
  </div>
  <div class="card p-3 border-t-3 border-brand-navy">
    <div class="font-bold text-brand-navy-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-clock-outline" /> Después (EVA 4)</div>
    <ul class="leading-relaxed text-ink/85 space-y-1">
      <li>Catálogo de aplicaciones</li>
      <li>Catálogo de departamentos</li>
      <li>Revisión periódica de accesos</li>
    </ul>
    <div class="mt-2 text-ink-soft">Diseñadas completas; solo se construyen después.</div>
  </div>
  <div class="card p-3 border-t-3 border-slate-400">
    <div class="font-bold text-ink mb-1.5 flex items-center gap-1.5"><div class="i-mdi-cancel" /> No lo haremos</div>
    <ul class="leading-relaxed text-ink/85 space-y-1">
      <li>Modificar las 37 aplicaciones</li>
      <li>Versión para celulares</li>
      <li>Login con cuenta Microsoft</li>
      <li>Conexión automática con RRHH</li>
    </ul>
  </div>
</div>

<!--
Guion (Bloque 1):
"El MVP, que es lo que vamos a construir para la EVA 3, cabe en una frase: un portal donde TI aprueba accesos, asigna perfiles en vez de permisos sueltos, copia los perfiles de una persona a otra en una sola pantalla y gestiona excepciones; y donde cada colaborador ve sus permisos.
A la izquierda está lo que entra. Al centro, tres funciones que ya están diseñadas pero que construiremos después, porque ninguna bloquea a las demás. A la derecha, lo que dejamos fuera a propósito: por ejemplo, no vamos a tocar las 37 aplicaciones, porque es un riesgo operativo que el cliente no acepta."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 2 · Planificación y equipo</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-calendar-range mr-1 text-brand-red" /> Cronograma</span>
</div>

# <span class="i-mdi-flag-checkered align-middle mr-2 text-brand-navy" /> Plan de trabajo: 4 hitos hasta la EVA 3

<div class="grid grid-cols-4 gap-2 mt-3 text-xs">
  <div class="card p-3 border-t-3 border-brand-red">
    <div class="text-brand-red font-extrabold text-sm">H1 · Sprint 1</div>
    <div class="font-bold mb-1">Acceso y cuentas</div>
    <div class="text-ink/80 leading-snug">Login, solicitar y aprobar acceso, contraseña por correo y bajas automáticas.</div>
    <div class="mt-2 text-ink-soft"><b>Se cierra cuando:</b> alguien pide acceso, otro lo aprueba y la persona entra.</div>
  </div>
  <div class="card p-3 border-t-3 border-brand-navy">
    <div class="text-brand-navy font-extrabold text-sm">H2 · Sprint 2</div>
    <div class="font-bold mb-1">Permisos y perfiles</div>
    <div class="text-ink/80 leading-snug">Perfiles, asignarlos, copiarlos, excepciones y bajas.</div>
    <div class="mt-2 text-ink-soft"><b>Se cierra cuando:</b> un cambio de perfil afecta solo a quienes se eligieron.</div>
  </div>
  <div class="card p-3 border-t-3 border-brand-crimson">
    <div class="text-brand-crimson font-extrabold text-sm">H3 · Sprint 3</div>
    <div class="font-bold mb-1">Vista personal y compatibilidad</div>
    <div class="text-ink/80 leading-snug">«Mis permisos» y respuesta idéntica a las 37 aplicaciones.</div>
    <div class="mt-2 text-ink-soft"><b>Se cierra cuando:</b> las apps reciben lo mismo que con el sistema actual.</div>
  </div>
  <div class="card p-3 border-t-3 border-slate-500">
    <div class="text-ink font-extrabold text-sm">H4 · Sprint 3</div>
    <div class="font-bold mb-1">Registro, seguridad y rendimiento</div>
    <div class="text-ink/80 leading-snug">Bitácora, permisos validados en el servidor y prueba de carga.</div>
    <div class="mt-2 text-ink-soft"><b>Se cierra cuando:</b> nadie puede borrar la bitácora y la carga se cumple.</div>
  </div>
</div>

<div class="grid grid-cols-3 gap-3 mt-3 text-xs">
  <div class="card p-2.5 flex items-center gap-2"><div class="i-mdi-format-list-checks text-lg text-brand-red shrink-0" /><span><b>28 tareas</b> con responsable, dependencias y sprint</span></div>
  <div class="card p-2.5 flex items-center gap-2"><div class="i-mdi-sync text-lg text-brand-navy shrink-0" /><span>Sprints de <b>2 semanas</b> con revisión del profesor</span></div>
  <div class="card p-2.5 flex items-center gap-2"><div class="i-mdi-check-all text-lg text-brand-crimson shrink-0" /><span><b>«Terminado»</b> = revisado por otro, probado y sin claves en el código</span></div>
</div>

<!--
Guion (Bloque 2):
"Siguiendo su indicación, organizamos el trabajo en cuatro hitos, uno por cada grupo de requisitos más importante. Primero el acceso y las cuentas, porque sin cuentas nada más funciona. Después los permisos y perfiles, que es el corazón del problema. En el tercer sprint, la vista personal, la compatibilidad con las 37 aplicaciones, la bitácora y la prueba de carga.
Cada hito tiene una prueba de cierre concreta. En el informe están las 28 tareas, con su responsable, de qué depende cada una y en qué sprint va. Una tarea solo está terminada si la revisó otro integrante, tiene sus pruebas y no deja contraseñas en el código."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 2 · Planificación y equipo</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-account-cog mr-1 text-brand-red" /> Roles y estándares</span>
</div>

# <span class="i-mdi-account-group-outline align-middle mr-2 text-brand-navy" /> Cómo trabajamos: roles y reglas del equipo

<div class="grid grid-cols-3 gap-2 mt-3 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Arquitectura y Backend</b><div class="text-ink/80 mt-0.5">Estructura del sistema y reglas de negocio.</div></div>
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Frontend y UI/UX (2 personas)</b><div class="text-ink/80 mt-0.5">Las 8 pantallas y su facilidad de uso.</div></div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Base de Datos y Rendimiento</b><div class="text-ink/80 mt-0.5">Modelo de datos, velocidad y prueba de carga.</div></div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Requerimientos y Trazabilidad</b><div class="text-ink/80 mt-0.5">Que todo responda a una necesidad.</div></div>
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Ciberseguridad</b><div class="text-ink/80 mt-0.5">Contraseñas, roles y bitácora.</div></div>
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Scrum, DevOps y QA</b><div class="text-ink/80 mt-0.5">Ritmo del equipo, pipeline y pruebas.</div></div>
</div>

<div class="card p-3 mt-3 border-t-3 border-brand-navy text-xs">
  <div class="font-bold text-brand-navy-dark mb-2 flex items-center gap-1.5"><div class="i-mdi-source-branch" /> Estándares que aplicamos (Git y código)</div>
  <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-ink/85">
    <div class="flex gap-1.5"><div class="i-mdi-check text-brand-red shrink-0 mt-0.5" />Una rama corta por tarea; nadie sube directo a la rama principal.</div>
    <div class="flex gap-1.5"><div class="i-mdi-check text-brand-red shrink-0 mt-0.5" />Todo cambio lo revisa <b>otro integrante</b> antes de unirse.</div>
    <div class="flex gap-1.5"><div class="i-mdi-check text-brand-red shrink-0 mt-0.5" />El pipeline bloquea pruebas fallidas y contraseñas escritas en el código.</div>
    <div class="flex gap-1.5"><div class="i-mdi-check text-brand-red shrink-0 mt-0.5" />Mensajes de commit estándar y convenciones de C#, TypeScript y SQL.</div>
  </div>
</div>

<!--
Guion (Bloque 2):
"Usted nos aclaró que los roles y perfiles de esta evaluación son los nuestros como equipo. Mantuvimos los seis roles de la EVA 1, con un ajuste: el frontend ahora lo llevan dos personas, porque pasamos de cinco a ocho pantallas.
Abajo están las reglas que aplicamos en el código. La principal: nadie, ni siquiera quien administra el repositorio, puede subir un cambio sin que otro integrante lo revise. Es la misma idea de separación de funciones que el sistema aplica a sus usuarios."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 3 · Arquitectura e infraestructura</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-sitemap-outline mr-1 text-brand-red" /> Modelo 4+1</span>
</div>

# <span class="i-mdi-layers-outline align-middle mr-2 text-brand-red" /> Arquitectura: una aplicación ordenada

<div class="grid grid-cols-[1fr_1fr] gap-4 mt-2 items-start">

<div class="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
  <img src="./assets/img/01-vista-logica.png" class="mx-auto" style="max-height: 340px; width: auto" alt="Vista lógica: portal, API RBAC, datos y servicios externos" />
</div>

<div class="flex flex-col gap-2 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">¿Por qué una sola aplicación?</b><br />Es lo que un equipo de 6 puede construir, probar y defender en un semestre. Microservicios fue descartado.</div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">La regla del cliente</b><br />«La pregunta y la respuesta siguen siendo las mismas»: cambia el canal (ahora un endpoint REST), no lo que reciben.</div>
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Modelo 4+1</b><br />Qué hace (lógica) · cómo se organiza el código (desarrollo) · qué pasa en ejecución (procesos) · dónde corre (física) + escenarios.</div>
</div>

</div>

<!--
Guion (Bloque 3):
"La arquitectura la describimos con el modelo 4+1. En simple: una sola aplicación central, ordenada por módulos, que atiende tanto a TI como a los colaboradores. Elegimos una sola aplicación y no microservicios porque es lo que un equipo de seis puede construir y probar en un semestre.
La clave está en esto: hoy la base de datos calcula los permisos cada vez que una aplicación pregunta. Nosotros los calculamos solo cuando algo cambia y dejamos la respuesta lista. Así cumplimos lo que pidió el cliente: la pregunta y la respuesta siguen siendo las mismas, pero la base deja de sobrecargarse."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 3 · Arquitectura e infraestructura</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-server-network mr-1 text-brand-red" /> Vista física</span>
</div>

# <span class="i-mdi-server-outline align-middle mr-2 text-brand-navy" /> Dónde corre la solución

<div class="grid grid-cols-[1.35fr_1fr] gap-4 mt-2 items-start">

<div class="card p-2">
  <img src="./assets/img/05-vista-fisica.png" class="block mx-auto rounded-lg" style="max-height: 350px; width: auto" alt="Vista física con servidores IIS balanceados, SQL Server, Redis, correo y directorio AD" />
</div>

<div class="flex flex-col gap-2 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Varios servidores IIS con balanceo</b><br />Si uno se cae, el otro sigue atendiendo y nadie pierde su sesión.</div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Los datos se quedan en MSC</b><br />En el SQL Server que ya usan; Redis solo guarda copias rápidas.</div>
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Sin contraseñas en el código</b><br />No hay acceso a Key Vault, así que la base se conecta con una cuenta de servicio de Windows que nadie conoce.</div>
  <div class="card p-2.5 border-l-3 border-slate-400"><b>Metas medibles</b><br />Disponibilidad y tiempos de recuperación definidos, en vez de «cero caídas».</div>
</div>

</div>

<!--
Guion (Bloque 3):
"Esta es la vista física, basada en lo que nos contó el cliente: la aplicación corre en varios servidores IIS con balanceo de carga. Si uno se cae, el balanceador manda todo al otro, y la sesión sigue funcionando porque las llaves de la sesión se comparten entre servidores.
Los datos se quedan en el SQL Server de MSC. Como no podemos usar Key Vault, la aplicación se conecta a la base con una cuenta de servicio de Windows, así que no hay ninguna contraseña de la base escrita en ninguna parte. Y en vez de prometer cero caídas, como en la EVA 1, definimos metas que se pueden medir."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 3 · Arquitectura e infraestructura</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-alert-decagram-outline mr-1 text-brand-red" /> Caso borde · Concurrencia</span>
</div>

# <span class="i-mdi-help-rhombus-outline align-middle mr-2 text-brand-red" /> ¿Qué pasa si dos administradores cambian al mismo usuario a la vez?

<div class="card p-2 mt-2">
  <img src="./assets/img/16-escenario-dos-administradores.png" class="mx-auto rounded-lg" style="max-height: 220px; max-width: 100%; width: auto" alt="Flujo por componentes del escenario de dos administradores modificando el mismo usuario" />
</div>

<div class="grid grid-cols-2 gap-2 mt-2 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Qué pasa</b><br />La base deja pasar al primero; el segundo recibe «otro lo modificó, recargue» (409).</div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Por qué así</b><br />Evaluamos la cola en Redis que nos sugirió el docente, pero elegimos el bloqueo de fila porque agrega menos piezas.</div>
</div>

<!--
Guion (Bloque 3):
"Usted nos pidió enfocar los escenarios del 4+1 en los casos borde. El más delicado es el que nos planteó: dos administradores que, al mismo tiempo, dan y quitan el mismo permiso desde servidores distintos. Lo resolvemos en la base de datos, que es el único punto común: la base bloquea a esa persona mientras dura el primer cambio, y el segundo administrador recibe un aviso para recargar. Evaluamos la cola en Redis que nos sugirió, pero elegimos el bloqueo de fila porque agrega menos piezas."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 3 · Arquitectura e infraestructura</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-alert-decagram-outline mr-1 text-brand-red" /> Caso borde · Redis caído</span>
</div>

# <span class="i-mdi-help-rhombus-outline align-middle mr-2 text-brand-navy" /> ¿Qué pasa si se cae Redis?

<div class="card p-2 mt-2">
  <img src="./assets/img/15-escenario-redis-caido.png" class="mx-auto rounded-lg" style="max-height: 220px; max-width: 100%; width: auto" alt="Flujo por componentes del escenario de consulta con Redis caído" />
</div>

<div class="card p-2.5 border-l-3 border-brand-navy mt-2 text-xs">
  <b class="text-brand-navy-dark">Qué pasa</b><br />La API espera como máximo 50&nbsp;ms, responde desde SQL Server y emite una alerta a operación: un poco más lento, pero sin errores para el satélite.
</div>

<!--
Guion (Bloque 3):
"También cubrimos qué pasa si se cae Redis: la API no se queda esperando, espera máximo 50 milisegundos, lee la respuesta directo de SQL Server y avisa a operación. El satélite nunca ve un error, solo una respuesta un poco más lenta."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 3 · Arquitectura e infraestructura</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-alert-decagram-outline mr-1 text-brand-red" /> Caso borde · Desvinculación</span>
</div>

# <span class="i-mdi-help-rhombus-outline align-middle mr-2 text-brand-crimson" /> ¿Qué pasa si despiden a alguien, o el directorio falla?

<div class="card p-2 mt-2">
  <img src="./assets/img/17-escenario-desvinculacion.png" class="mx-auto rounded-lg" style="max-height: 220px; max-width: 100%; width: auto" alt="Flujo por componentes del escenario de desvinculación con freno de seguridad" />
</div>

<div class="grid grid-cols-2 gap-2 mt-2 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Despiden a alguien</b><br />En la siguiente sincronización (máximo 10 minutos) pierde todo acceso, sin que nadie tenga que avisarlo.</div>
  <div class="card p-2.5 border-l-3 border-slate-400"><b>Lista vacía o anómala</b><br />Se activa el freno: no se desactiva a nadie y se avisa a TI. 15 casos borde documentados en total, cada uno con su prueba.</div>
</div>

<!--
Guion (Bloque 3, cierre de escenarios):
"También cubrimos qué pasa si despiden a alguien o si el directorio manda una lista vacía por error. En la siguiente sincronización, máximo 10 minutos, la persona pierde todo acceso sin que nadie tenga que avisarlo. Y si la lista llega vacía o con muchas menos personas, se activa un freno: no se desactiva a nadie y se avisa a TI, para no confundir una falla del directorio con una ola de despidos. En total documentamos 15 casos borde, cada uno con su prueba."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 4 · Interfaces</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-login mr-1 text-brand-red" /> Flujo de acceso</span>
</div>

# <span class="i-mdi-account-key-outline align-middle mr-2 text-brand-navy" /> Cómo entra una persona al sistema

<div class="grid grid-cols-5 gap-1.5 mt-2 text-xs text-center">
  <div class="card p-2 border-t-3 border-brand-red"><div class="i-mdi-hand-wave-outline text-xl text-brand-red mx-auto" /><b>1. Solicita</b><div class="text-ink/75">Solo si existe en el directorio</div></div>
  <div class="card p-2 border-t-3 border-brand-red"><div class="i-mdi-account-check-outline text-xl text-brand-red mx-auto" /><b>2. Otro aprueba</b><div class="text-ink/75">Y le asigna su perfil</div></div>
  <div class="card p-2 border-t-3 border-brand-navy"><div class="i-mdi-email-fast-outline text-xl text-brand-navy mx-auto" /><b>3. Llega un enlace</b><div class="text-ink/75">De un solo uso, 15 min</div></div>
  <div class="card p-2 border-t-3 border-brand-navy"><div class="i-mdi-form-textbox-password text-xl text-brand-navy mx-auto" /><b>4. Crea su clave</b><div class="text-ink/75">TI nunca la conoce</div></div>
  <div class="card p-2 border-t-3 border-brand-crimson"><div class="i-mdi-door-open text-xl text-brand-crimson mx-auto" /><b>5. Entra</b><div class="text-ink/75">Según su rol</div></div>
</div>

<div class="grid grid-cols-[1.5fr_1fr] gap-3 mt-3 items-start">
  <div class="card p-2"><img src="./assets/img/w00-login.png" class="w-full rounded-lg" alt="Wireframe de inicio de sesión y definición de contraseña" /></div>
  <div class="flex flex-col gap-2 text-xs">
    <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Errores claros, sin dar pistas</b><br />«Usuario o contraseña incorrectos», sin decir cuál falló.</div>
    <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Freno a la fuerza bruta</b><br />5 intentos fallidos bloquean la cuenta 15 minutos.</div>
    <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Enlace vencido</b><br />Se puede pedir otro sin volver a aprobar.</div>
  </div>
</div>

<!--
Guion (Bloque 4):
"Las pantallas las diseñamos a partir de las tareas reales. Esta es la entrada al sistema. La persona pide acceso, pero solo si ya existe en el directorio de la empresa. Un administrador distinto de quien creó la solicitud la aprueba y le asigna su perfil en el mismo paso. Le llega un enlace que sirve una sola vez y vence a los 15 minutos, como recomienda OWASP; crea su propia contraseña, y entra a la parte que le corresponde según su rol.
Así resolvemos lo que el cliente no quería repetir: la contraseña ya no se ve, ya no es nombre.apellido, y nadie de TI la conoce."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 4 · Interfaces</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-monitor-dashboard mr-1 text-brand-red" /> 8 pantallas</span>
</div>

# <span class="i-mdi-application-outline align-middle mr-2 text-brand-red" /> Las pantallas que resuelven el problema

<div class="grid grid-cols-2 gap-3 mt-2">
  <div class="card p-2">
    <div class="text-xs font-bold text-brand-red-dark mb-1 flex items-center gap-1"><div class="i-mdi-content-copy" /> Comparar y clonar · adiós a la «doble ventana»</div>
    <img src="./assets/img/w02-clonacion.png" class="w-full rounded-lg" alt="Wireframe de comparación y clonación" />
  </div>
  <div class="card p-2">
    <div class="text-xs font-bold text-brand-navy-dark mb-1 flex items-center gap-1"><div class="i-mdi-eye-outline" /> Mis permisos · lo nuevo que pidió el cliente</div>
    <img src="./assets/img/w06-mis-permisos.png" class="w-full rounded-lg" alt="Wireframe de la vista Mis permisos" />
  </div>
</div>

<div class="card p-2.5 mt-3 text-xs flex flex-wrap gap-x-4 gap-y-1 text-ink/85">
  <b class="text-brand-navy-dark">Las 8:</b>
  <span>Login</span><span>Mis permisos</span><span>Solicitudes de acceso</span><span>Ficha del colaborador</span><span>Comparar y clonar</span><span>Excepciones</span><span>Plantilla de perfil</span><span>Bitácora</span>
  <span class="text-ink-soft">· Cada una con su requisito, validaciones y 16 mensajes de error definidos.</span>
</div>

<!--
Guion (Bloque 4):
"Diseñamos ocho pantallas. Destacamos dos. A la izquierda, comparar y clonar: reemplaza la doble ventana. Se eligen dos personas, se ven las diferencias lado a lado y se copian los perfiles con un clic, pidiendo motivo y ticket.
A la derecha, Mis permisos, el requisito nuevo que usted nos pidió: cada colaborador ve a qué aplicaciones tiene acceso y de dónde viene cada permiso. Es solo de lectura.
Cada pantalla indica qué requisito cubre, qué valida y qué mensaje muestra si algo falla. Ocultar un botón es solo una ayuda: todo se vuelve a verificar en el servidor."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 5 · Datos</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-database-outline mr-1 text-brand-red" /> Modelo relacional</span>
</div>

# <span class="i-mdi-database-cog-outline align-middle mr-2 text-brand-navy" /> Datos: qué guardamos y qué reglas cumplen

<div class="grid grid-cols-[1.1fr_1fr] gap-4 mt-2">

<div class="card p-3">

```mermaid
flowchart LR
  classDef red fill:#FEE2E2,stroke:#E11927,stroke-width:2px,color:#991B1B;
  classDef navy fill:#E0E7FF,stroke:#0A2540,stroke-width:2px,color:#0A2540;
  classDef dark fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#FFFFFF;
  P["Colaborador<br/>(desde AD)"]:::navy --> CU["Cuenta<br/>(clave en hash)"]:::navy
  P --> A["Perfil asignado<br/>en una versión"]:::red
  P --> E["Excepción<br/>con vencimiento"]:::red
  A --> PE[("Permisos<br/>listos")]:::dark
  E --> PE
  PE --> B[("Bitácora<br/>inmutable")]:::dark
```

</div>

<div class="flex flex-col gap-2 text-xs">
  <div class="card p-2.5 border-l-3 border-brand-red"><b class="text-brand-red-dark">Cambio de perfil: ¿a todos o a algunos?</b><br />Cada cambio crea una versión nueva; TI elige a quién aplicarla.</div>
  <div class="card p-2.5 border-l-3 border-brand-navy"><b class="text-brand-navy-dark">Clonar copia perfiles, no excepciones</b><br />Las excepciones son personales y requieren su propia aprobación.</div>
  <div class="card p-2.5 border-l-3 border-brand-crimson"><b class="text-brand-crimson">Nada cambia sin registro</b><br />El cambio y su anotación en la bitácora se guardan juntos o no se guarda nada.</div>
  <div class="card p-2.5 border-l-3 border-slate-400"><b>Base real</b><br />Partimos del sistema actual; el profesor nos enviará el esquema real para ajustar.</div>
</div>

</div>

<!--
Guion (Bloque 5):
"El modelo de datos parte del sistema actual, donde a cada persona se le asignan los permisos de cada aplicación uno por uno. Lo que faltaba era el perfil: un paquete de permisos que se asigna de una vez. En simple: el colaborador viene del directorio, tiene una cuenta con su clave guardada de forma irreversible, tiene perfiles y, si corresponde, excepciones con fecha de término. De ahí se calcula la lista de permisos lista para entregar.
Hay tres reglas importantes. Cuando se cambia un perfil se crea una versión nueva, y TI decide si aplicarla a todos o solo a algunos, como acordamos con el cliente. Al clonar se copian los perfiles, no las excepciones. Y nada cambia sin quedar registrado. En el informe están el diagrama completo, el diccionario de datos y diez reglas de integridad."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 5 · Datos</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-lightning-bolt-outline mr-1 text-brand-red" /> Modelo no relacional</span>
</div>

# <span class="i-mdi-flash-outline align-middle mr-2 text-brand-red" /> ¿Por qué también Redis?

<div class="grid grid-cols-2 gap-4 mt-3 text-xs">
  <div class="card p-4 border-t-3 border-brand-navy">
    <div class="font-bold text-brand-navy-dark text-sm mb-2 flex items-center gap-1.5"><div class="i-mdi-database" /> SQL Server (relacional)</div>
    <ul class="space-y-1.5 text-ink/85 leading-relaxed">
      <li><b>Fuente de verdad:</b> todo lo oficial vive aquí.</li>
      <li>Reglas, relaciones e historial completo.</li>
      <li>Responde las consultas de siempre de las 37 apps.</li>
    </ul>
  </div>
  <div class="card p-4 border-t-3 border-brand-red">
    <div class="font-bold text-brand-red-dark text-sm mb-2 flex items-center gap-1.5"><div class="i-mdi-flash" /> Redis (no relacional)</div>
    <ul class="space-y-1.5 text-ink/85 leading-relaxed">
      <li>Guarda <b>una ficha lista por persona</b> con sus permisos.</li>
      <li>Se lee de memoria, sin buscar ni cruzar tablas.</li>
      <li>Si se borra o se cae, <b>no se pierde nada</b>: se rehace desde SQL.</li>
    </ul>
  </div>
</div>

<div class="grid grid-cols-3 gap-3 mt-3 text-xs">
  <div class="card p-3 text-center"><div class="text-2xl font-extrabold text-brand-red">~300</div><div class="text-ink-soft">usuarios en hora punta</div></div>
  <div class="card p-3 text-center"><div class="text-2xl font-extrabold text-brand-navy">~600</div><div class="text-ink-soft">consultas simultáneas a la API</div></div>
  <div class="card p-3 text-center"><div class="text-2xl font-extrabold text-brand-crimson">10 min</div><div class="text-ink-soft">duración máxima de cada ficha</div></div>
</div>

<!--
Guion (Bloque 5):
"Usamos dos tipos de almacenamiento y cada uno tiene un motivo. SQL Server es la fuente de verdad: ahí están las reglas, las relaciones y el historial. Redis guarda una ficha por persona con sus permisos ya resueltos, lista para entregarla.
¿Por qué no guardar eso también en SQL? Porque las aplicaciones siempre hacen la misma pregunta, qué permisos tiene esta persona, y Redis la responde desde memoria, sin cruzar tablas. Según el cliente, en hora punta hay unas 600 consultas al mismo tiempo, y las mismas personas se consultan muchas veces. Si Redis se cae, no perdemos nada, porque todo se rehace desde SQL."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 6 · Seguridad, pruebas y trazabilidad</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-shield-lock-outline mr-1 text-brand-red" /> Seguridad</span>
</div>

# <span class="i-mdi-shield-account-outline align-middle mr-2 text-brand-red" /> Seguridad: quién puede hacer qué

<div class="grid grid-cols-[1.25fr_1fr] gap-4 mt-2 text-xs">

<div class="flex flex-col gap-2">
  <div class="grid grid-cols-2 gap-2">
    <div class="card p-2.5 border-l-4 border-brand-red"><b class="text-brand-red-dark">Administrador TI</b><br />Gestiona accesos, perfiles y excepciones.</div>
    <div class="card p-2.5 border-l-4 border-brand-navy"><b class="text-brand-navy-dark">Colaborador</b><br />Ve sus permisos. Incluye a los pasantes de TI.</div>
  </div>
  <div class="card p-2.5">
    <div class="font-bold text-brand-navy-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-table-key" /> Matriz de permisos</div>
    <table class="w-full text-xs">
      <thead><tr><th class="text-left">Acción</th><th class="whitespace-nowrap">Admin. TI</th><th>Colaborador</th></tr></thead>
      <tbody>
        <tr><td>Ver sus propios permisos</td><td class="text-center">✓</td><td class="text-center">✓</td></tr>
        <tr><td>Ver permisos de otras personas</td><td class="text-center">✓</td><td class="text-center">✗</td></tr>
        <tr><td>Asignar perfiles, clonar, dar de baja</td><td class="text-center">✓ ²</td><td class="text-center">✗</td></tr>
        <tr><td>Solicitar y aprobar excepciones</td><td class="text-center">✓ ¹ ²</td><td class="text-center">✗</td></tr>
        <tr><td>Consultar la bitácora</td><td class="text-center">✓</td><td class="text-center">✗</td></tr>
        <tr><td>Modificar o borrar la bitácora</td><td class="text-center">✗</td><td class="text-center">✗</td></tr>
      </tbody>
    </table>
    <div class="mt-1 text-ink-soft">¹ No aprueba lo que él creó · ² Nunca sobre sí mismo · Lo demás está denegado.</div>
  </div>
</div>

<div class="flex flex-col gap-2">
  <div class="card p-2.5">
    <div class="font-bold text-brand-navy-dark mb-1.5 flex items-center gap-1.5"><div class="i-mdi-key-chain-variant" /> Contraseñas: antes y ahora</div>
    <table class="w-full text-xs">
      <thead><tr><th class="text-left">Sistema actual</th><th class="text-left">Nuevo diseño</th></tr></thead>
      <tbody>
        <tr><td>Se puede ver en pantalla</td><td>Nadie la ve, ni TI</td></tr>
        <tr><td>Guardada de forma reversible</td><td>Hash irreversible</td></tr>
        <tr><td>Suele ser «nombre.apellido»</td><td>Mínimo 12 caracteres</td></tr>
        <tr><td>Sin límite de intentos</td><td>Bloqueo tras 5 intentos</td></tr>
        <tr><td>La entrega TI</td><td>La crea la persona con un enlace</td></tr>
      </tbody>
    </table>
  </div>
  <div class="card p-2.5 border-t-3 border-brand-crimson">
    <b class="text-brand-crimson">Ocultar un botón no basta</b>
    <div class="text-ink/85 mt-0.5">Cada acción se vuelve a verificar en el servidor.</div>
  </div>
</div>

</div>

<!--
Guion (Bloque 6):
"El portal tiene dos roles para personas, los que definió el cliente: el Administrador TI, que gestiona los accesos, y el Colaborador, que solo ve sus permisos; los pasantes de TI quedan como colaboradores.
En la matriz se ve qué puede hacer cada uno. Todo lo que no aparece está denegado. La separación de funciones que nos pidió en el feedback está en las notas de la tabla: nadie aprueba lo que él mismo creó y nadie se modifica a sí mismo. Por eso el sistema necesita al menos dos administradores. Y ocultar un botón es solo una ayuda: cada acción se vuelve a verificar en el servidor.
A la derecha, el cambio más visible: las contraseñas. Hoy se ven y se pueden revertir. En el nuevo diseño nadie las ve, se guardan de forma irreversible y la persona crea la suya con un enlace."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 6 · Seguridad, pruebas y trazabilidad</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-test-tube mr-1 text-brand-red" /> Plan de pruebas</span>
</div>

# <span class="i-mdi-check-decagram-outline align-middle mr-2 text-brand-navy" /> Cómo sabremos que funciona

<div class="grid grid-cols-4 gap-3 mt-3 text-xs">
  <div class="card p-3 text-center border-t-3 border-brand-navy"><div class="text-2xl font-extrabold text-brand-navy">23</div><div class="text-ink-soft">casos de que <b>funciona</b></div></div>
  <div class="card p-3 text-center border-t-3 border-brand-red"><div class="text-2xl font-extrabold text-brand-red">12</div><div class="text-ink-soft">casos de que <b>rechaza</b> lo incorrecto</div></div>
  <div class="card p-3 text-center border-t-3 border-brand-crimson"><div class="text-2xl font-extrabold text-brand-crimson">16</div><div class="text-ink-soft">casos de <b>seguridad</b></div></div>
  <div class="card p-3 text-center border-t-3 border-slate-500"><div class="text-2xl font-extrabold text-ink">4</div><div class="text-ink-soft">escenarios de <b>carga</b>, hasta 600 consultas simultáneas</div></div>
</div>

<div class="grid grid-cols-2 gap-3 mt-3 text-xs">
  <div class="card p-3 border-l-4 border-brand-red">
    <div class="font-bold text-brand-red-dark mb-1">Ejemplo · CP-06 · RF-12: despido</div>
    <div class="text-ink/85"><b>Dado</b> un colaborador con permisos, <b>cuando</b> desaparece del directorio, <b>entonces</b> en 10 minutos o menos queda sin acceso, las 37 apps no reciben sus permisos y queda registrado.</div>
  </div>
  <div class="card p-3 border-l-4 border-brand-navy">
    <div class="font-bold text-brand-navy-dark mb-1">Ejemplo · CP-34 · RF-11 y RF-15: aprobarse a sí mismo</div>
    <div class="text-ink/85"><b>Dado</b> un administrador que creó una solicitud, <b>cuando</b> intenta aprobarla, <b>entonces</b> el sistema la rechaza, sigue pendiente y el intento queda registrado.</div>
  </div>
</div>

<div class="mt-3 text-xs text-ink-soft flex items-center gap-1.5"><div class="i-mdi-information-outline" /> Cada requisito tiene al menos una prueba con resultado observable. Los resultados se presentan en la EVA 3.</div>

<!--
Guion (Bloque 6):
"El plan tiene 51 casos de prueba: 23 que verifican que cada función hace lo que promete, 12 que verifican que el sistema rechaza lo incorrecto sin cambiar nada, y 16 de seguridad. Además hay cuatro escenarios de carga: según el cliente, en hora punta unos 300 usuarios generan unas 600 consultas simultáneas, y la prueba sube por escalones hasta ese nivel.
Cada caso tiene un resultado que se puede comprobar sin interpretación. Y cada caso está vinculado a un requisito. Por ejemplo, el CP-06 prueba el RF-12: si una persona desaparece del directorio, en 10 minutos o menos debe quedar sin acceso. El CP-34 prueba la separación de funciones: si un administrador intenta aprobar su propia solicitud, el sistema la rechaza. Todo requisito tiene al menos una prueba, y los resultados los mostraremos en la EVA 3."
-->

---

<div class="flex-between items-center mb-1">
  <div class="eyebrow">Bloque 6 · Seguridad, pruebas y trazabilidad</div>
  <span class="chip bg-slate-100 text-xs font-semibold text-ink-soft border border-slate-200"><div class="i-mdi-link-variant mr-1 text-brand-red" /> Trazabilidad</span>
</div>

# <span class="i-mdi-transit-connection-variant align-middle mr-2 text-brand-red" /> Todo se conecta con una necesidad

<div class="grid grid-cols-7 gap-1 mt-3 text-xs text-center">
  <div class="card p-2 border-t-3 border-brand-red"><b>Necesidad</b><div class="text-ink/75 mt-1">N-10 · ver mis permisos</div></div>
  <div class="card p-2 border-t-3 border-brand-red"><b>Historia</b><div class="text-ink/75 mt-1">HU14</div></div>
  <div class="card p-2 border-t-3 border-brand-navy"><b>Requisito</b><div class="text-ink/75 mt-1">RF-14</div></div>
  <div class="card p-2 border-t-3 border-brand-navy"><b>Pantalla</b><div class="text-ink/75 mt-1">Mis permisos</div></div>
  <div class="card p-2 border-t-3 border-brand-crimson"><b>Dato</b><div class="text-ink/75 mt-1">Permisos listos</div></div>
  <div class="card p-2 border-t-3 border-brand-crimson"><b>Seguridad</b><div class="text-ink/75 mt-1">Solo lo propio</div></div>
  <div class="card p-2 border-t-3 border-slate-500"><b>Prueba</b><div class="text-ink/75 mt-1">CP-15, CP-37</div></div>
</div>

<div class="grid grid-cols-2 gap-3 mt-4 text-xs">
  <div class="card p-3 border-l-4 border-brand-navy">
    <div class="font-bold text-brand-navy-dark mb-1 flex items-center gap-1.5"><div class="i-mdi-rocket-launch-outline" /> Próximo paso: Sprint 1</div>
    <div class="text-ink/85">Construir el hito 1, acceso y cuentas. La demostración será pedir acceso, aprobarlo con otro administrador, crear la clave y entrar.</div>
  </div>
  <div class="card p-3 border-l-4 border-slate-400">
    <div class="font-bold mb-1 flex items-center gap-1.5"><div class="i-mdi-clipboard-clock-outline" /> Pendientes declarados</div>
    <ul class="text-ink/85 space-y-0.5">
      <li>Tiempos actuales de alta, cambio y baja (línea base).</li>
      <li>Entrevista con RRHH.</li>
      <li>Esquema real de la base de datos.</li>
    </ul>
  </div>
</div>

<!--
Guion (Bloque 6, cierre):
"Para cerrar: cada elemento del diseño se puede seguir desde una necesidad hasta una prueba. Por ejemplo, la necesidad de que cada persona vea sus permisos se convierte en la historia 14 y el requisito 14, se resuelve en la pantalla Mis permisos, usa la lista de permisos ya calculada, solo muestra lo propio y se verifica con dos pruebas. En el informe está la matriz completa para todos los requisitos.
Lo siguiente es el sprint 1, el acceso y las cuentas. Y somos transparentes con lo pendiente: los tiempos actuales de cada operación, la entrevista con RRHH y el esquema real de la base."
-->

---
layout: end
transition: fade
---

<div class="flex-center flex-col text-center">

<div class="eyebrow mb-2">Proyecto Integrado · TIHV43 · Evaluación 2</div>

# ¡Muchas <span class="brand-gradient brand-gradient-flow">Gracias!</span>

<p class="mt-2 text-lg text-ink/75">Diseño de la solución · RBAC MSC Chile</p>

<div class="mt-8 p-3.5 rounded-lg bg-white/70 border border-black/5 text-xs text-ink/80">
  <b>Docente:</b> Profesor Edgar López &nbsp;·&nbsp; <b>Grupo:</b> G07 &nbsp;·&nbsp; <b>Fecha:</b> 17-11-2026
</div>

<div class="mt-6 text-base font-bold text-brand-red-dark flex items-center justify-center gap-2">
  <div class="i-mdi-comment-question-outline text-xl" /> Quedamos atentos a sus preguntas
</div>

</div>

<!--
Guion (cierre):
"Muchas gracias, profesor. Quedamos atentos a sus preguntas; cualquiera de nosotros puede responder sobre cualquier parte del diseño."
-->
