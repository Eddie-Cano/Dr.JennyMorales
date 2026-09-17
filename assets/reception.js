(()=>{
'use strict';
const engine=window.LeadReception, $=id=>document.getElementById(id);
const dialog=$('receptionDialog'),log=$('receptionLog'),choices=$('receptionChoices'),input=$('receptionInput');
if(!engine||!dialog)return;
let state={},field=null,lastTrigger=null,finished=false;
function say(text,role='assistant'){
 const p=document.createElement('p');p.className='reception-message '+role;p.textContent=text;log.append(p);log.scrollTop=log.scrollHeight;
}
function choice(label,fn){const b=document.createElement('button');b.type='button';b.className='reception-choice';b.textContent=label;b.addEventListener('click',fn);choices.append(b);}
function mirror(){
 for(const k of ['name','phone','email']){
  const value=state[k]==='Omitir correo'?'':state[k]||'';
  $('lead-'+k).value=value;
 }
 if(state.service)$('lead-service').value=state.service;
 if(state.intent)$('lead-intent').value=state.intent;
 if(state.timing)$('lead-timing').value=state.timing;
}
function ask(){
 choices.replaceChildren();field=engine.next(state);
 if(!field){finish();return;}
 finished=false;$('receptionAnswer').hidden=false;
 $('receptionLabel').textContent=field.label;input.value='';input.placeholder=field.placeholder||'Selecciona una opción';
 input.type=field.key==='phone'?'tel':field.key==='email'?'email':'text';
 input.maxLength=field.key==='phone'?22:field.key==='name'?120:160;
 input.hidden=!!field.options&&field.key!=='email';
 $('receptionSend').hidden=input.hidden;
 say(field.label);
 (field.options||[]).forEach(value=>choice(value,()=>answer(value)));
 if(!input.hidden)input.focus();
}
function answer(value){
 if(!field||finished)return;
 if(!engine.valid(field.key,value)){say(field.key==='phone'?'Usa 10 dígitos ficticios para este ejemplo.':'Revisa el dato o utiliza una de las opciones disponibles.');return;}
 state[field.key]=value.trim();say(value,'visitor');mirror();ask();
}
function finish(){
 finished=true;$('receptionAnswer').hidden=true;choices.replaceChildren();
 const authorized=state.consent==='Sí, simular autorización';
 say(authorized?'Este sería el resumen del prospecto para revisión del consultorio. No se ha enviado.':'No se generaría una solicitud de contacto sin autorización. Esta demostración no envía información.');
 const summary=document.createElement('div');summary.className='lead-summary';
 const entries=[['Estado',engine.classification(state)],['Nombre',state.name],['Teléfono de ejemplo',state.phone],['Correo',state.email],['Motivo',state.service],['Intención',state.intent],['Preferencia',state.timing],['Identificación','Pendiente; se pediría en el formulario privado antes de aprobar la cita']];
 entries.forEach(([label,value])=>{const p=document.createElement('p'),b=document.createElement('strong');b.textContent=label+': ';p.append(b,document.createTextNode(value));summary.append(p);});
 log.append(summary);say('Demostración finalizada. No se guardó un prospecto en el consultorio, no se validó una identificación, no se abrió un chat personal ni se apartó una cita.');
 choice('Editar mis datos de ejemplo',()=>{dialog.close();$('lead-name').focus();});
 choice('Reiniciar conversación',()=>{state={};mirror();log.replaceChildren();ask();});
 log.scrollTop=log.scrollHeight;
}
function open(trigger){
 lastTrigger=trigger;log.replaceChildren();choices.replaceChildren();
 const originalName=$('name')?.value||'',originalPhone=$('phone')?.value||'',originalEmail=$('email')?.value||'';
 const values={name:$('lead-name').value||originalName,phone:$('lead-phone').value||originalPhone,email:$('lead-email').value||originalEmail,service:$('lead-service').value,intent:$('lead-intent').value,timing:$('lead-timing').value};
 // Changes made in either form win; unanswered fields are requested in the chat.
 state={};
 for(const [k,v]of Object.entries(values)){if(engine.valid(k,v))state[k]=v.trim();}
 finished=false;dialog.showModal();
 say('Soy el asistente virtual del consultorio. Esta es una demostración guiada: utiliza datos ficticios. No se envían solicitudes ni mensajes. Puedo reunir tu información sin que contactes directamente a la doctora.');
 if(Object.keys(state).length)say('Ya tengo los datos válidos que escribiste en el formulario; solo completaré lo que falta.');
 ask();
}
document.querySelectorAll('[data-open-reception]').forEach(b=>b.addEventListener('click',()=>open(b)));
$('leadForm').addEventListener('submit',e=>{e.preventDefault();if($('leadForm').reportValidity())open($('leadContinue'));});
$('receptionAnswer').addEventListener('submit',e=>{e.preventDefault();answer(input.value);});
$('receptionClose').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{lastTrigger?.focus();});
$('receptionPrices').addEventListener('click',()=>say(engine.prices()));
$('receptionRouting').addEventListener('click',()=>{
 say('SIMULACIÓN DE BASE DE DATOS. Selecciona un escenario ficticio; no se está consultando un expediente real.');
 const panel=document.createElement('div');panel.className='routing-scenarios';
 for(const scenario of Object.values(engine.scenarios)){
  const b=document.createElement('button');b.type='button';b.className='reception-choice';b.textContent=scenario.name;
  b.addEventListener('click',()=>say('ESCENARIO FICTICIO · '+scenario.name+'\nAcceso: '+scenario.identity+'\nNivel: '+scenario.level+'\nAcción: '+scenario.action+'\nNo se envió ningún recado ni se consultó una base de datos real.'));
  panel.append(b);
 }
 log.append(panel);log.scrollTop=log.scrollHeight;
});
$('receptionServices').addEventListener('click',()=>say('La especialidad confirmada es Endodoncia. La valoración permite conocer las opciones para tu diente. Otros tratamientos, costos y horarios deben confirmarse con la doctora. No doy diagnósticos ni indicaciones de medicamentos.'));
$('leadExample').addEventListener('click',()=>{ $('lead-name').value='Ana de ejemplo';$('lead-phone').value='0000000000';$('lead-email').value='ana@example.com';$('lead-service').value='Valoración de endodoncia';$('lead-intent').value='Solicitar una valoración';$('lead-timing').value='Esta semana';});
$('leadClear').addEventListener('click',()=>{state={};$('leadForm').reset();log.replaceChildren();$('lead-name').focus();});
if(new URLSearchParams(location.search).get('recepcion')==='1')open(document.querySelector('[data-open-reception]'));
})();
