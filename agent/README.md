# Recepción de prospectos de Jenny Morales

## Objetivo
Captar interesados nuevos y reunir información administrativa antes de que el consultorio revise la solicitud. No confundir prospecto, solicitud, identidad revisada, cita aprobada ni pago confirmado.

## Estado
La página implementa una DEMOSTRACIÓN GUIADA local, no un modelo de IA activo. No envía, almacena ni notifica prospectos reales. El chat continúa con los datos válidos presentes en el formulario de primer contacto y puede reutilizar nombre, teléfono y correo del formulario anterior. No pide documentos por chat. Datos de ejemplo en memoria hasta recarga o borrado.

## Activación en Vercel
Vercel aloja el servidor del agente; el modelo se configura con instrucciones y una base de conocimiento. No requiere entrenar desde cero ni fine-tuning para este alcance.
1. Obtener acceso autorizado al proyecto dra-jenny-morales del equipo raiz-noble. La conexión actual devolvió 403 para ese equipo.
2. Aprobar con Jenny el catálogo, tarifas reales, horarios, revisión de identificaciones y condiciones de contacto.
3. Elegir proveedor de IA y configurar su clave únicamente en variables de entorno del servidor.
4. Crear un endpoint servidor para conversación con límites de uso, protección contra abuso y validación de entradas/salidas. La IA propone campos estructurados; el servidor los valida.
5. Conectar almacenamiento privado y acceso autenticado del consultorio. Separar prospectos y documentos. No enviar identificaciones al modelo.
6. Configurar consentimiento y aviso de privacidad antes de recibir datos reales.
7. Integrar un NÚMERO EMPRESARIAL de WhatsApp Business Platform dedicado a recepción si se desea atención dentro de WhatsApp. Quitar el número personal de la web no impide que alguien lo encuentre en Facebook u otros directorios.
8. Notificar al personal autorizado solo tras guardar correctamente la solicitud. No abrir wa.me al número personal ni revelar dicho número tras completar el formulario.
9. Probar el recorrido real, duplicados, reintentos, eliminación de datos y derivación humana antes de quitar el aviso de demostración.

## Campos mínimos
Nombre, teléfono, correo opcional, motivo administrativo, intención (información/presupuesto/valoración), disponibilidad y autorización explícita de contacto. Solicitar únicamente lo que falte. Confirmar el resumen antes de guardar. La identificación se mantiene en una etapa privada de solicitud de cita y requiere revisión del consultorio.

## Clasificación
Interés informativo; interés en presupuesto; interés en valoración; motivo por revisar; sin autorización de contacto.
No asignar confiabilidad, peligrosidad o elegibilidad por rostro, documento, origen, discapacidad, edad, género u otros atributos personales. No prometer seguridad por pedir una identificación.

## Prueba local de la demo
Abrir index.html?recepcion=1#recepcion.
- Formulario vacío: el asistente reúne todos los campos.
- Formulario parcial: solicita únicamente lo que falte.
- Formulario completo: solicita la autorización simulada y muestra resumen.
- Correo opcional con botón Omitir.
- Respuestas inválidas: permanece en el campo.
- Precios: muestra siempre PRECIOS FICTICIOS.
- No autorizar: no genera una solicitud de contacto.
- Borrar o reiniciar limpia los datos de ejemplo.
- Nunca se abre un chat personal, ni se realiza una petición de guardado.

## Fuentes
Especialidad: Facebook del consultorio y cédula aportada en el repositorio. Catálogo completo y tarifas NO verificados.
https://www.facebook.com/p/Dra-Jenny-Morales-Baizabal-Endodoncia-100092307797525/
https://vercel.com/docs/functions

## Validación de esta revisión
Motor de flujo probado con datos completos y parciales, validación de contacto y negativa de consentimiento. Sintaxis de los dos scripts revisada. Verificación estática de ausencia del número personal y enlaces directos en index.html. El entorno de navegador no estuvo disponible para esta revisión; no se afirma prueba visual ni integración real.

## Base de datos y niveles de atención
schema.sql contiene un diseño de PostgreSQL, NO una base de datos creada ni aplicada.
Tablas: contactos/prospectos, vínculos autenticados de pacientes, consentimientos, solicitudes, citas, revisiones de identificación, tareas del personal y auditoría.
Un prospecto se convierte en paciente únicamente por revisión del consultorio. No se identifica a una persona por coincidencia de teléfono/nombre ni por una afirmación en el chat.
El asistente accede solo a los datos mínimos autorizados de la sesión. Ningún cliente consulta expedientes de otros clientes. El proveedor de IA no recibe documentos ni un volcado de la base.

Niveles:
1. Recepción automática: información, precios aprobados y primera captación.
2. Gestión de agenda: paciente autenticado y autorizado, recordatorios y solicitudes de cambio.
3. Revisión de recepción: identidad pendiente, coincidencias ambiguas, referencias y solicitudes fuera del catálogo.
4. Jenny: preguntas clínicas y sobre tratamiento, quejas o asuntos que ella designe. Resumen con razón y acción pendiente; no se diagnostica ni se promete respuesta inmediata.
Estos son niveles administrativos, no un sistema de triaje médico. Una situación que requiere atención médica no debe quedar bloqueada por pago, identificación o verificación de registro.

La demostración permite probar cinco escenarios ficticios desde el botón Probar niveles de atención. Ninguno consulta una base de datos ni envía mensajes.
Antes de activar: acordar horarios de avisos, responsable suplente, tiempos de respuesta y canales de escalamiento. Las notificaciones externas requieren autorización y una integración configurada.
