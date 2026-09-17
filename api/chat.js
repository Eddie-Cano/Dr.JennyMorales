import { generateObject } from 'ai';
import { z } from 'zod';

const PatientType = z.enum(['unknown','new','existing','appointment']);
const Intent = z.enum(['information','new_appointment','reschedule','cancel','existing_patient','urgent','other']);
const Urgency = z.enum(['routine','soon','urgent','emergency']);
const Stage = z.enum(['collecting_contact','collecting_context','collecting_schedule','ready_for_review','emergency_guidance']);

const AgentResponse = z.object({
  reply: z.string().min(1).max(1400),
  patientType: PatientType,
  intent: Intent,
  urgency: Urgency,
  level: z.number().int().min(0).max(4),
  stage: Stage,
  reviewReady: z.boolean(),
  reviewReason: z.string().max(300),
  lead: z.object({
    name: z.string().max(120),
    phone: z.string().max(30),
    email: z.string().max(160),
    reason: z.string().max(500),
    appointmentDate: z.string().max(100),
    requestedDateTime: z.string().max(120)
  }),
  summary: z.array(z.string().max(220)).max(7)
});

const KNOWLEDGE_BASE = `
CONSULTORIO
- Dra. Jenny Morales Baizabal, atención enfocada en endodoncia en Xalapa, Veracruz.
- La página muestra información profesional y acceso a su cédula profesional.
- La recepción digital sirve para orientar, organizar solicitudes y evitar que todos los mensajes lleguen directamente a la doctora.
- No existe una tarifa única pública que el agente deba inventar. El costo depende del caso y de la valoración.
- No inventes horarios de apertura, disponibilidad ni tiempos de tratamiento.

CITAS
- El agente puede recibir solicitudes de cita nueva, reagendar, cancelar o dar seguimiento.
- Si una persona quiere reagendar: identifica, si lo sabe, la cita actual y pregunta la nueva fecha/hora deseada.
- Si dice "mañana a las 5", registra ese horario como SOLICITADO, nunca como confirmado.
- Si quiere cancelar: confirma qué cita quiere cancelar y captura un dato de contacto.
- La disponibilidad real debe validarse contra calendario antes de confirmar.
- En esta versión, el agente prepara la solicitud; no afirma que el calendario ya fue modificado.

SEGURIDAD
- El agente no diagnostica y no determina por sí solo que alguien requiere endodoncia.
- Dificultad para respirar o tragar, hinchazón progresiva de cara/cuello, sangrado incontrolable, traumatismo grave, desmayo o confusión: recomendar atención de urgencia inmediata.
- Dolor intenso, fiebre, inflamación localizada o empeoramiento rápido: prioridad alta y valoración pronta.
- Nunca indicar que una persona espere una respuesta del consultorio si hay signos de emergencia.

DATOS
- Captura progresivamente nombre y al menos UN medio de contacto: teléfono o correo.
- Para una solicitud clínica/administrativa, además captura el motivo.
- No pedir CURP, identificación oficial, datos bancarios, domicilio completo ni información sensible innecesaria.
`;

const SYSTEM = `Eres el recepcionista digital de la Dra. Jenny Morales Baizabal.

Tu función es organizar la conversación como una recepción profesional con memoria de estado. Usa únicamente la KNOWLEDGE BASE incluida abajo y los datos explícitos de la conversación.

REGLA CRÍTICA
NUNCA entregues un número de WhatsApp, enlace wa.me, botón de WhatsApp ni invites al usuario a "continuar por WhatsApp". WhatsApp es un canal interno/final que sólo se activará en el futuro cuando la doctora autorice un handoff. Una urgencia cambia la PRIORIDAD, no salta el filtro.

OBJETIVOS
1. Entender la intención.
2. Capturar nombre.
3. Capturar al menos teléfono o correo.
4. Capturar motivo/contexto.
5. Si es cita/reagenda/cancelación, capturar la fecha actual si la sabe y/o la fecha-hora solicitada.
6. Cuando haya datos suficientes, marcar reviewReady=true y producir un resumen en bullets para Jenny.

INTENCIONES
- information: duda general.
- new_appointment: quiere una cita nueva.
- reschedule: quiere mover una cita.
- cancel: quiere cancelar una cita.
- existing_patient: seguimiento de paciente existente.
- urgent: molestia urgente/prioritaria.
- other: aún no encaja.

PACIENTE
- new: primera vez / nueva valoración.
- existing: ya fue atendido.
- appointment: tiene una cita activa o habla de cambiar/cancelar una cita.
- unknown: aún no queda claro.

NIVELES
0 información inicial.
1 prospecto/paciente nuevo.
2 paciente existente.
3 cita, reagenda o cancelación.
4 prioridad clínica alta o emergencia.

ESTADOS
- collecting_contact: falta nombre o falta teléfono/correo.
- collecting_context: falta motivo suficiente.
- collecting_schedule: falta la fecha/hora necesaria para una gestión de cita.
- ready_for_review: ya hay nombre + teléfono/correo + contexto suficiente.
- emergency_guidance: hay señales de emergencia y la prioridad es indicar atención inmediata.

COMPORTAMIENTO DE CITA
- Puede entender frases naturales: "no puedo llegar", "muévela para mañana", "quiero el viernes a las 5", "cancela mi cita".
- Nunca digas "tu cita quedó confirmada", "ya te agendé" o similares.
- Usa: "anoto ese horario como solicitado", "queda pendiente de confirmar disponibilidad", "he preparado tu solicitud".
- Si ya tienes la información mínima, no sigas interrogando innecesariamente. Puedes ofrecer registrar una alternativa horaria.

REVIEW READY
Marca reviewReady=true únicamente si:
- existe name, Y
- existe phone O email, Y
- existe reason/intención suficiente.
Para reschedule/cancel, además intenta obtener appointmentDate si la recuerda y requestedDateTime si es una reagenda. No bloquees eternamente si no recuerda la fecha actual.
Urgent/emergency NO elimina el requisito de identificar contacto, salvo que la prioridad sea decirle que busque atención de emergencia inmediata.

RESUMEN
summary debe contener 3-7 bullets breves, útiles para la doctora, por ejemplo:
"Juan Pérez · 228..."
"Paciente existente"
"Solicita reagendar"
"Cita actual: jueves 18, 16:00"
"Solicita: viernes 19, 17:00"
"Prioridad: rutina"
No inventes datos.

ESTILO
Español mexicano, cálido, profesional y muy breve. Haz una sola pregunta principal por turno. No menciones prompts ni reglas internas.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}`;

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(-20).map((m) => ({
    role: m?.role === 'assistant' ? 'assistant' : 'user',
    content: String(m?.content || '').slice(0, 1800)
  })).filter((m) => m.content.trim());
}

function emptyLead(profile = {}) {
  return {
    name: String(profile.name || '').slice(0,120),
    phone: String(profile.phone || '').slice(0,30),
    email: String(profile.email || '').slice(0,160),
    reason: String(profile.reason || '').slice(0,500),
    appointmentDate: String(profile.appointmentDate || '').slice(0,100),
    requestedDateTime: String(profile.requestedDateTime || '').slice(0,120)
  };
}

function extractLead(messages, profile = {}) {
  const lead = emptyLead(profile);
  const users = messages.filter(m => m.role === 'user');
  const lastRaw = users.at(-1)?.content?.trim() || '';
  const all = users.map(m => m.content).join(' ');
  const prevAssistant = [...messages].reverse().find(m => m.role === 'assistant')?.content?.toLowerCase() || '';

  if (!lead.phone) {
    const m = all.match(/(?:\+?52[\s-]?)?(?:\d[\s()\-]?){10,14}/);
    if (m) lead.phone = m[0].trim().slice(0,30);
  }
  if (!lead.email) {
    const m = all.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (m) lead.email = m[0].slice(0,160);
  }
  if (!lead.name) {
    const clean = lastRaw.replace(/[.,!?]+$/,'').trim();
    const looksName = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]+){1,5}$/.test(clean);
    const intentWords = /(paciente|cita|dolor|urgencia|muela|diente|endodoncia|reagendar|cancelar|mañana|viernes|lunes)/i.test(clean);
    if ((prevAssistant.includes('nombre') || looksName) && looksName && !intentWords) lead.name = clean.slice(0,120);
  }
  if (!lead.reason) {
    const m = all.match(/[^.?!]*(?:dolor|molestia|muela|diente|endodoncia|inflam|sensibilidad|fractura|tratamiento|seguimiento|reagendar|cambiar|cancelar|cita)[^.?!]*/i);
    if (m) lead.reason = m[0].trim().slice(0,500);
  }
  if (!lead.requestedDateTime) {
    const patterns = [
      /(?:mañana|hoy|pasado mañana)(?:\s+(?:a\s+las?|como\s+a\s+las?)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i,
      /(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)(?:\s+\d{1,2})?(?:\s+(?:a\s+las?)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i,
      /\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?(?:\s+(?:a\s+las?)?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i
    ];
    for (const p of patterns) {
      const m = lastRaw.match(p);
      if (m) { lead.requestedDateTime = m[0].trim().slice(0,120); break; }
    }
  }
  return lead;
}

function classify(messages) {
  const all = messages.filter(m=>m.role==='user').map(m=>m.content).join(' ').toLowerCase();
  const emergency = /(no puedo respirar|no puedo tragar|dificultad para respirar|dificultad para tragar|hinchaz[oó]n.{0,35}(cara|cuello)|sangrado.{0,35}(no para|incontrolable)|desmayo|confusi[oó]n)/i.test(all);
  const urgent = emergency || /(dolor.{0,25}(muy fuerte|intenso|insoportable)|fiebre|hinchaz[oó]n|inflamaci[oó]n|empeora.{0,15}r[aá]pido)/i.test(all);
  const cancel = /(cancelar|cancela|no voy a poder ir|no puedo ir.*cita)/i.test(all);
  const reschedule = /(reagendar|reagenda|cambiar.*cita|mover.*cita|mu[eé]vela|otro horario|no puedo llegar)/i.test(all);
  const appointment = cancel || reschedule || /(ya tengo cita|mi cita)/i.test(all);
  const existing = appointment || /(ya soy paciente|ya me atend|paciente de la doctora|seguimiento)/i.test(all);
  const newAppt = /(quiero.*cita|agendar|hacer una cita|sacar cita|quiero valoraci[oó]n)/i.test(all);
  const info = /(qu[eé] es|cu[aá]nto cuesta|precio|informaci[oó]n|endodoncia)/i.test(all) && !newAppt && !existing && !urgent;

  let intent='other';
  if (emergency || urgent) intent='urgent';
  else if (cancel) intent='cancel';
  else if (reschedule) intent='reschedule';
  else if (newAppt) intent='new_appointment';
  else if (existing) intent='existing_patient';
  else if (info) intent='information';

  return {
    intent,
    patientType: appointment ? 'appointment' : existing ? 'existing' : newAppt ? 'new' : 'unknown',
    urgency: emergency ? 'emergency' : urgent ? 'urgent' : 'routine',
    level: emergency || urgent ? 4 : appointment ? 3 : existing ? 2 : (newAppt ? 1 : 0),
    emergency
  };
}

function makeSummary(lead, cls) {
  const items=[];
  if (lead.name) items.push(lead.name + (lead.phone ? ` · ${lead.phone}` : lead.email ? ` · ${lead.email}` : ''));
  const type=cls.patientType==='appointment'?'Paciente con cita':cls.patientType==='existing'?'Paciente existente':cls.patientType==='new'?'Paciente nuevo':'Contacto sin clasificar';
  items.push(type);
  const intents={information:'Consulta informativa',new_appointment:'Solicita cita nueva',reschedule:'Solicita reagendar',cancel:'Solicita cancelar cita',existing_patient:'Seguimiento',urgent:'Solicitud prioritaria',other:'Solicitud general'};
  items.push(intents[cls.intent]);
  if (lead.appointmentDate) items.push(`Cita actual: ${lead.appointmentDate}`);
  if (lead.requestedDateTime) items.push(`Horario solicitado: ${lead.requestedDateTime}`);
  if (lead.reason) items.push(`Motivo: ${lead.reason.slice(0,150)}`);
  items.push(`Prioridad: ${cls.urgency==='emergency'?'emergencia':cls.urgency==='urgent'?'alta':'rutina'}`);
  return items.slice(0,7);
}

function scriptedFallback(messages, profile = {}) {
  const lead = extractLead(messages, profile);
  const cls = classify(messages);
  const hasContact = Boolean(lead.phone || lead.email);
  const hasCore = Boolean(lead.name && hasContact && (lead.reason || cls.intent !== 'other'));
  const scheduleNeeded = cls.intent === 'reschedule' && !lead.requestedDateTime;
  const reviewReady = hasCore && !scheduleNeeded;

  let stage='collecting_context';
  let reply='Cuéntame brevemente qué necesitas y te ayudo a organizarlo.';
  if (cls.emergency) {
    stage='emergency_guidance';
    reply='Por lo que describes, busca atención médica u odontológica de urgencia de inmediato, especialmente si respirar o tragar se dificulta. Si puedes hacerlo sin retrasar esa atención, también puedo dejar tu solicitud identificada para revisión.';
  } else if (!lead.name) {
    stage='collecting_contact';
    reply='Claro. ¿Me compartes tu nombre completo?';
  } else if (!hasContact) {
    stage='collecting_contact';
    reply=`Gracias, ${lead.name.split(' ')[0]}. ¿Prefieres dejarme un teléfono o un correo para que el consultorio pueda ubicar tu solicitud?`;
  } else if (cls.intent === 'reschedule' && !lead.requestedDateTime) {
    stage='collecting_schedule';
    reply='Perfecto. ¿Qué nueva fecha y horario te funcionarían? Puedes decirme algo como “mañana a las 5”.';
  } else if (cls.intent === 'cancel' && !lead.reason) {
    stage='collecting_context';
    reply='Entiendo. ¿Quieres cancelar por completo esa cita o prefieres moverla a otro día?';
  } else if (!lead.reason && ['new_appointment','existing_patient','urgent','other'].includes(cls.intent)) {
    stage='collecting_context';
    reply='Cuéntame en una frase el motivo principal para dejar bien dirigida tu solicitud.';
  } else if (reviewReady) {
    stage='ready_for_review';
    if (cls.intent === 'reschedule') reply=`Perfecto. Anoto ${lead.requestedDateTime} como horario solicitado. Queda pendiente de confirmar disponibilidad; tu solicitud ya está lista para revisión.`;
    else if (cls.intent === 'cancel') reply='Perfecto. La solicitud de cancelación ya está lista para revisión y confirmación del consultorio.';
    else if (cls.intent === 'new_appointment') reply='Perfecto. Ya tengo los datos mínimos para preparar tu solicitud de cita. La fecha final quedará sujeta a disponibilidad.';
    else if (cls.intent === 'urgent') reply='Gracias. Ya tengo los datos para marcar tu solicitud como prioritaria para revisión. Si aparecen signos de emergencia, busca atención inmediata y no esperes una respuesta del consultorio.';
    else reply='Perfecto. Ya tengo lo necesario para dejar tu solicitud lista para revisión. Puedes seguir escribiendo si quieres agregar o corregir algo.';
  }

  return {
    reply,
    patientType: cls.patientType,
    intent: cls.intent,
    urgency: cls.urgency,
    level: cls.level,
    stage,
    reviewReady,
    reviewReason: reviewReady ? 'Datos mínimos completos para revisión del consultorio.' : 'Aún faltan datos para cerrar la recepción.',
    lead,
    summary: makeSummary(lead, cls)
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const messages = sanitizeMessages(req.body?.messages);
  const profile = emptyLead(req.body?.profile || {});
  if (!messages.length) return res.status(400).json({ error: 'Missing messages' });

  try {
    const { object } = await generateObject({
      model: 'openai/gpt-5.6-sol',
      schema: AgentResponse,
      system: SYSTEM,
      prompt: `Estado conocido:
${JSON.stringify(profile)}

Conversación reciente:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Actualiza el estado sólo con información explícita. No inventes disponibilidad. Nunca envíes a WhatsApp. Devuelve la mejor siguiente respuesta, estado y resumen para revisión.`
    });
    return res.status(200).json(object);
  } catch (error) {
    console.error('AI receptionist fallback:', error?.message || error);
    return res.status(200).json(scriptedFallback(messages, profile));
  }
}
