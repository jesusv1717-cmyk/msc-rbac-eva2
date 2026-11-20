# Preguntas Probables y Respuestas

Estas son las preguntas que el profesor puede hacerte sobre el bloque 4. La pauta dice que las preguntas se centran en **decisiones** y en **trazabilidad**. Responde con la estructura: **qué hicimos, por qué y qué requerimiento cubre**.

**¿Qué requerimiento cubre esta pantalla?**
Usa la tabla de las 8 pantallas de la lámina 12. Por ejemplo: «Comparar y clonar cubre RF-03, con las historias HU02 y HU08, y atiende la necesidad N-02, eliminar la doble ventana».

**¿Por qué diseñaron primero las pantallas desde las tareas y no desde la base de datos?**
Porque la pauta y el cliente valoran que el sistema resuelva el trabajo real. Si partiéramos de las tablas, tendríamos pantallas de «mantenedor» como las del sistema actual, y el problema de la doble ventana seguiría existiendo.

**¿Qué pasa si el enlace del correo ya se usó o venció?**
Aparece «Este enlace ya no es válido» (ERR-15). Si el acceso ya estaba aprobado, la persona puede pedir otro enlace sin una nueva aprobación. Al emitir uno nuevo, el anterior queda invalidado.

**¿Qué pasa si alguien intenta adivinar una contraseña?**
Después de 5 intentos fallidos la cuenta se bloquea 15 minutos (ERR-14). El mensaje es siempre el mismo, sin decir si falló el usuario o la contraseña, y cada intento queda en la bitácora. Lo valida la prueba CP-43.

**¿Por qué no se envía la contraseña por correo, como sugirió el profesor?**
Tomamos su idea y la llevamos un paso más allá. En vez de enviar una contraseña autogenerada, enviamos un enlace de un solo uso para que la persona cree la suya. Así ninguna contraseña real viaja por correo y nadie de TI la conoce.

**¿Qué pasa si un colaborador intenta ver los permisos de otra persona?**
La API rechaza la solicitud con 403 (ERR-09), porque toma la identidad de la sesión y no de lo que envía la pantalla. Lo valida la prueba CP-37.

**¿Ocultar los botones según el rol no es suficiente?**
No. Es solo ayuda visual. Si alguien llama directo a la API sin pasar por la pantalla, la API vuelve a verificar el rol y rechaza la operación. La pauta lo menciona como señal de riesgo: «permisos solo visuales».

**¿Qué diferencia hay entre perfil y permiso en estas pantallas?**
Un permiso es el acceso a una aplicación con una de sus opciones; un perfil es el paquete de permisos de un puesto, como «Operador de muelle». Cada persona tiene un solo perfil: en clonación se copia ese perfil, y en Mis permisos cada permiso indica si viene de un perfil o de una excepción.

**¿Qué pasa si dos administradores editan la misma plantilla de perfil?**
La pantalla avisa que otro administrador la está editando. No la bloquea, pero si los dos guardan, el segundo recibe «otro administrador modificó este registro, recargue» (ERR-05), y así no se pisan los cambios.

**¿Cómo van a probar que funciona en Citrix si no tienen acceso?**
Lo declaramos como limitación. Lo compensamos probando en Microsoft Edge, el mismo navegador de Citrix, con la resolución mínima de 1366 × 768 y usando solo el teclado (prueba CP-23).

**¿Dónde están las pantallas de departamentos y recertificación?**
Quedan para la EVA 4, porque no bloquean al resto del MVP. Ya tienen su flujo definido en el informe (sección 6.1) y reutilizan los mismos componentes.

**¿Qué pasa si eliminamos la pantalla de comparar y clonar?**
Se deja de cubrir la necesidad más importante del cliente, N-02: TI volvería a la doble ventana, con el riesgo de omitir permisos o de dar permisos de más.

**Si no sabes una respuesta:** di en qué sección del informe está y qué necesidad atiende. Por ejemplo: «Eso está en la sección 6.3 del informe, donde definimos los 16 mensajes de error». Es mejor que improvisar algo incorrecto.
