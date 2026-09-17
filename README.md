# Dra. Jenny Morales Baizabal · Endodoncia

Página estática en español con diseño responsive, Facebook, presentación, casos clínicos, enlace a cédula profesional y una interfaz de solicitud de citas.

## Estado de entrega

- `index.html` está cargado en este repositorio.
- Este cambio no activa un alojamiento web ni GitHub Pages.
- La cédula `15656534-C1.pdf` ya está en el repositorio y enlazada.
- Las cuatro imágenes y el logo oficial ya están en el repositorio y sus rutas en el HTML coinciden con los nombres cargados.
- La agenda y la recepción de identificaciones están deshabilitadas hasta conectar un servicio real. La demo es local; el contacto directo por WhatsApp es un enlace independiente.

## Archivos integrados

Los siguientes archivos están en la raíz, junto a `index.html`:

1. `89acfd59-8498-42b5-a9c0-580e78429549.png`
2. `14292121-d54d-4e8b-a93f-b7008e0c7879.png`
3. `6b92b506-ae11-4ab5-9de7-04bdddca3f1b.png`
4. `d4d7eb18-939e-40e6-8bbe-0588fa39689f.png`
5. `aa890bbb-d883-479d-9b7a-06eefe553191.png`

La cédula `15656534-C1.pdf` ya está cargada.

El logo oficial se referencia en encabezado, presentación y pie de página. El encuadre CSS elimina visualmente los márgenes vacíos de la imagen cuadrada y conserva el símbolo y el nombre completos. Ya no se extrae el logo de una radiografía. El contenido del PDF no se ha verificado clínicamente.

## Agenda: integración pendiente

Configurar `API_BASE` en el script del HTML con un servicio HTTPS del consultorio. Esta entrega incluye únicamente el cliente de la API, no el servidor.

### GET /config

```json
{"enabled":true,"privacyUrl":"https://dominio-del-consultorio/privacidad","timeZone":"America/Mexico_City"}
```

### GET /slots?date=YYYY-MM-DD

Devuelve `{ "slots": [{ "id": "identificador-real", "start": "fecha ISO-8601 con zona" }] }`. Debe devolver disponibilidad real, sin información personal de otros pacientes.

### POST /bookings

Recibe multipart/form-data: `name`, `email`, `phone`, `identity`, `slotId`, `privacyConsent`, `whatsappConsent`, `website`. El cliente envía `Idempotency-Key` para reintentos del mismo envío.

Respuesta de éxito: `{ "bookingId": "folio-real", "status": "pending_confirmation" }`. Responder HTTP 409 si el horario ya no está disponible.

El servidor debe validar los campos, consentimiento, contenido y tamaño del archivo; reservar el horario atómicamente; implementar idempotencia y protección contra abuso; almacenar la identificación fuera de cualquier directorio público; y proporcionar acceso autenticado al personal autorizado. Si API y página usan orígenes diferentes, configurar CORS para el origen autorizado y la cabecera Idempotency-Key.

La confirmación de cita y el posterior mensaje de WhatsApp corresponden al consultorio. La automatización de mensajes no está implementada.

Antes de habilitar la recepción, completar el aviso de privacidad con domicilio del responsable, contacto para ejercer derechos, conservación, eliminación y demás condiciones aplicables. Nunca guardar identificaciones de pacientes, secretos o claves API en este repositorio.

## Validación efectuada

Se comprobaron la sintaxis JavaScript, la presentación en escritorio y móvil y el recorrido local de demostración (aprobación, rechazo, reinicio y salida). No se probaron reservas reales porque el repositorio no incluye un servidor de agenda. Las imágenes y el PDF referenciados existen.

## Presentación y demostración de septiembre de 2026

- Diseño renovado en `assets/refinement.css`, presentación de la doctora y dos retratos restaurados con IA y ampliados, optimizados como WebP. Revisar con la doctora la fidelidad de las fotografías antes de su uso definitivo.
- `assets/jenny-retrato.webp`: 2048 × 2048; `assets/jenny-consultorio.webp`: 2244 × 2804. La ampliación no implica recuperar detalles originales inexistentes. Se conservaron los archivos originales del repositorio.
- Se mantiene el formulario de paciente, incluida identificación, consentimientos y contrato API. Con `API_BASE` vacío la carga real y la reserva siguen inactivas.
- El botón **Explorar demo de agenda y anticipo** abre una simulación local con datos ficticios y documento de ejemplo. También se puede abrir `?demo=1#cita`.
- Recorrido: consentimientos de demostración → fecha y horario ficticios → anticipo ilustrativo de $300 MXN → resultado aprobado o rechazado → vista previa de mensaje no enviado. No hay reservas, cobros, cargas de documentos ni mensajes reales.
- En la demo la ID continúa pendiente de revisión: cargar una identificación no constituye verificación de identidad. El importe y la política de anticipos necesitan definición del consultorio.
- Los accesos directos a WhatsApp y teléfono se sustituyeron por recepción virtual. No se muestra el número personal en index.html.
- `Demo_Jenny_Morales.html` dirige a la demostración actualizada en index.html. Ejecutar `python build-preview.py` para generar una copia autónoma actualizada; los enlaces externos requieren internet.

### Fotografías

Restauración con la herramienta integrada de imágenes. Prompts: mejorar resolución, nitidez y exposición sin cambiar identidad, pose, ropa ni consultorio; conservar blanco y negro en la segunda fotografía. Conversión y ampliación de salida con Sharp a las dimensiones indicadas. Las imágenes restauradas son interpretaciones asistidas por IA y deben revisarse con la persona retratada.

### Validación de esta revisión

Pruebas completadas en Chromium: flujo completo de demo, resultado rechazado, reinicio, salida, navegación móvil, ausencia de envíos POST y almacenamiento local, sin errores JavaScript ni desbordamiento horizontal. La integración API real no puede darse por validada sin servidor.

### Fuentes revisadas

- Facebook oficial enlazado en la página.
- Directorio externo: https://www.mexicodentistas.com/dentista/consultorio-dental-especializado-en-endodoncia-dra-jenny-morales-baizabal-xalapa . No se copiaron calificaciones, horarios ni servicios no corroborados.
- Educación general de endodoncia: https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/ . El texto clínico debe revisarse por la doctora.
- Se leyó el PDF de cédula aportado; no se realizó una validación independiente ante el registro.


## Recepción de prospectos

La recepción es una demostración guiada, no una IA conectada. Ofrece formulario y conversación con datos compartidos, preguntas solo sobre campos faltantes y clasificación por intención. No persiste ni envía prospectos reales. Se conserva el formulario original con identificación para la etapa de cita. Los precios de la recepción son ficticios y se etiquetan como tales.

Configuración del agente, catálogo pendiente de aprobar e integración real: `agent/README.md`, `agent/instructions.md` y `agent/knowledge.json`. La generación de citas y pagos sigue siendo demostrativa.

La revisión de recepción se validó con pruebas del motor en JavaScript y comprobaciones estáticas; el entorno de navegador no estuvo disponible para repetir la revisión visual.
