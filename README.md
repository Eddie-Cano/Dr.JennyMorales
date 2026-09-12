# Dra. Jenny Morales Baizabal · Endodoncia

Página estática en español con diseño responsive, Facebook, presentación, casos clínicos, enlace a cédula profesional y una interfaz de solicitud de citas.

## Estado de entrega

- `index.html` está cargado en este repositorio.
- Este cambio no activa un alojamiento web ni GitHub Pages.
- Las cuatro imágenes y el PDF no pudieron transferirse: el entorno de archivos de la conversación está fuera de servicio. No están incluidos en este commit. Sus referencias ya están en el HTML.
- La agenda y la recepción de identificaciones están deshabilitadas hasta conectar un servicio real. No se envía al paciente a WhatsApp ni se generan reservas ficticias.

## Archivos pendientes

Colocar estos archivos originales en la raíz, junto a `index.html`, conservando exactamente los nombres:

1. `89acfd59-8498-42b5-a9c0-580e78429549(1).png`
2. `14292121-d54d-4e8b-a93f-b7008e0c7879(1).png`
3. `6b92b506-ae11-4ab5-9de7-04bdddca3f1b(1).png`
4. `d4d7eb18-939e-40e6-8bbe-0588fa39689f(1).png`
5. `15656534-C1.pdf`

El logo se muestra mediante un encuadre CSS de la primera imagen, donde aparece el logotipo original. No se generó ni sustituyó por otro logotipo. El PDF debe revisarse antes de publicación; no fue posible comprobar sus contenidos en esta sesión.

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

Se comprobó la sintaxis JavaScript antes de subir el HTML. No hubo pruebas visuales en navegador ni pruebas de reservas reales, por falta de entorno y de servicio de agenda. Las referencias locales a imágenes y PDF no funcionarán hasta añadir los cinco archivos indicados.
