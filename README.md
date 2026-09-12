# Dra. Jenny Morales Baizabal · Endodoncia

Página estática en español con diseño responsive, Facebook, presentación, casos clínicos, enlace a cédula profesional y una interfaz de solicitud de citas.

## Estado de entrega

- `index.html` está cargado en este repositorio.
- Este cambio no activa un alojamiento web ni GitHub Pages.
- La cédula `15656534-C1.pdf` ya está en el repositorio y enlazada.
- Las cuatro imágenes y el logo oficial ya están en el repositorio y sus rutas en el HTML coinciden con los nombres cargados.
- La agenda y la recepción de identificaciones están deshabilitadas hasta conectar un servicio real. No se envía al paciente a WhatsApp ni se generan reservas ficticias.

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

Se comprobó la sintaxis JavaScript antes de subir el HTML. No hubo pruebas visuales en navegador ni pruebas de reservas reales, por falta de entorno y de servicio de agenda. Se comprobó que las referencias a las cuatro imágenes y al logo coinciden con los archivos cargados. Los enlaces a la cédula coinciden con el PDF existente.
