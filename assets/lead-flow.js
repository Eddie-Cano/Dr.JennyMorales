/* Guided demo only. No remote model, lead storage, document or payment processing. */
(function(root){
  'use strict';
  const fields=[
    {key:'service',label:'¿Qué te gustaría consultar?',options:['Valoración de endodoncia','Información sobre endodoncia','Otro motivo']},
    {key:'intent',label:'¿Qué te gustaría hacer después?',options:['Solo información','Conocer un precio orientativo','Solicitar una valoración']},
    {key:'name',label:'¿Qué nombre de ejemplo usamos para tu solicitud?',placeholder:'Ejemplo: Ana Pérez'},
    {key:'phone',label:'¿Qué teléfono de ejemplo incluimos? Usa 10 dígitos ficticios.',placeholder:'Ejemplo: 0000000000'},
    {key:'email',label:'¿Quieres añadir un correo de ejemplo? También puedes omitirlo.',placeholder:'persona@example.com',options:['Omitir correo']},
    {key:'timing',label:'¿Cuándo te gustaría acudir, en este ejemplo?',options:['Esta semana','La próxima semana','Tengo flexibilidad']},
    {key:'consent',label:'En el servicio real pediríamos autorización para contactarte sobre esta solicitud. ¿Simulamos esa autorización?',options:['Sí, simular autorización','No autorizar']}
  ];
  function valid(key,value){
    const v=String(value||'').trim();
    const field=fields.find(f=>f.key===key);
    if(!field)return false;
    if(key==='name')return v.length>=3&&v.length<=120&&!/[<>]/.test(v);
    if(key==='phone')return /^\d{10}$/.test(v.replace(/[\s()+-]/g,''));
    if(key==='email')return v==='Omitir correo'||(v.length<=160&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    return field.options.includes(v);
  }
  function next(state){return fields.find(f=>!valid(f.key,state[f.key]))||null;}
  function classification(state){
    if(state.consent!=='Sí, simular autorización')return 'Sin autorización de contacto';
    if(state.service==='Otro motivo')return 'Motivo por revisar con el consultorio';
    if(state.intent==='Solicitar una valoración')return 'Interés en valoración';
    if(state.intent==='Conocer un precio orientativo')return 'Interés en presupuesto';
    return 'Interés informativo';
  }
  function prices(){return 'PRECIOS FICTICIOS PARA DEMOSTRACIÓN. Valoración: $500 MXN. Endodoncia: ejemplo de $3,500 a $5,500 MXN. Anticipo: $300 MXN. No son tarifas de Jenny ni una cotización. El costo real y lo que incluye deben confirmarse después de valorar el caso.';}
  
  const scenarios={
    prospect:{name:'Prospecto nuevo',identity:'Sin vínculo de paciente',level:'Recepción automática',action:'Recoger motivo, intención, datos faltantes y permiso de contacto. Solicitud pendiente; no es paciente todavía.'},
    existing:{name:'Paciente existente sin cita',identity:'Acceso verificado de ejemplo',level:'Gestión de agenda',action:'Consultar opciones para solicitar una nueva cita. No repetir datos verificados; confirmar si siguen vigentes.'},
    appointment:{name:'Paciente existente con cita',identity:'Acceso verificado de ejemplo',level:'Gestión de agenda',action:'Mostrar solo su cita autorizada y gestionar solicitud de cambio. Un cambio no se confirma hasta validar disponibilidad.'},
    unverified:{name:'Dice ser paciente pero no verifica acceso',identity:'No verificado',level:'Revisión de recepción',action:'Verificar acceso sin revelar si existe un expediente ni mostrar citas. Ofrecer revisión del consultorio.'},
    clinical:{name:'Pregunta sobre un tratamiento',identity:'Registro ficticio; revisión humana',level:'Recado para Jenny',action:'Preparar resumen breve y motivo de consulta clínica para revisión. El asistente no responde con diagnóstico ni medicación.'}
  };
  root.LeadReception={fields,valid,next,classification,prices,scenarios};
})(typeof window==='undefined'?globalThis:window);
