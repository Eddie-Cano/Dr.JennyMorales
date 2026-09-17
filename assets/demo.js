/* A local-only presentation. Real booking remains in index.html and is never
   called by this demo. No document/card data, storage, network or WhatsApp send. */
(() => {
  const el = id => document.getElementById(id);
  const form = el('patientForm');
  let active = false, slot = null;
  const original = {
    help: el('identityHelp').textContent,
    calendarIntro: el('calendarStep').querySelector('.calendar-intro').textContent,
    progress: el('progress3').textContent,
    privacy: el('privacyConsent').nextElementSibling.innerHTML,
    whatsapp: el('whatsappConsent').nextElementSibling.innerHTML
  };
  const mexicoDay = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const format = iso => new Intl.DateTimeFormat('es-MX',{timeZone:'America/Mexico_City',dateStyle:'long',timeStyle:'short'}).format(new Date(iso));
  function show(step) {
    form.hidden = step !== 1;
    el('calendarStep').hidden = step !== 2;
    el('paymentStep').hidden = step !== 3;
    el('demoSuccess').hidden = step !== 4;
    el('successStep').hidden = true;
    [1,2,3].forEach(n => {
      const p = el('progress'+n), current=n===Math.min(step,3);
      p.classList.toggle('active',current);
      if(current)p.setAttribute('aria-current','step');else p.removeAttribute('aria-current');
    });
  }
  function resetSlot(){slot=null;el('slots').replaceChildren();el('bookButton').disabled=true;el('selectionSummary').hidden=true;}
  function start() {
    // Do not offer a simulation if a real booking service was configured.
    if (typeof API_BASE !== 'undefined' && API_BASE) return;
    active=true;form.reset();resetSlot();
    el('availabilityNotice').hidden=true;el('demoBanner').hidden=false;
    for(const [id,value] of Object.entries({name:'Paciente de ejemplo',email:'paciente@example.com',phone:'2280000000'})) {el(id).value=value;el(id).readOnly=true;}
    el('identity').disabled=true;el('identity').required=false;
    el('identityHelp').textContent='Campo de identificación conservado. En esta demostración se utiliza un documento ficticio y no se aceptan archivos.';
    el('demoIdentity').hidden=false;
    el('privacyConsent').nextElementSibling.textContent='Entiendo que los datos y el documento son ficticios y que esta demostración no envía información.';
    el('whatsappConsent').nextElementSibling.textContent='Quiero ver un ejemplo de la confirmación por WhatsApp. No se enviará ningún mensaje.';
    el('nextButton').disabled=false;
    el('progress3').textContent='3. Anticipo demo';
    el('calendarStep').querySelector('.calendar-intro').textContent='Horarios de ejemplo en zona de Ciudad de México. No representan disponibilidad real ni reservan una cita.';
    el('bookButton').textContent='Ver anticipo de ejemplo →';
    el('date').min=mexicoDay();el('date').value='';el('calendarMessage').textContent='Selecciona una fecha para explorar la demostración.';
    el('formMessage').textContent='';el('paymentMessage').textContent='';el('paymentOutcome').value='approved';
    show(1);el('privacyConsent').focus();
  }
  function exit() {
    active=false;form.reset();resetSlot();
    ['name','email','phone'].forEach(id=>el(id).readOnly=false);
    el('identity').required=true;el('identity').disabled=true;el('nextButton').disabled=true;
    el('identityHelp').textContent=original.help;el('demoIdentity').hidden=true;el('demoBanner').hidden=true;
    el('privacyConsent').nextElementSibling.innerHTML=original.privacy;el('whatsappConsent').nextElementSibling.innerHTML=original.whatsapp;
    el('calendarStep').querySelector('.calendar-intro').textContent=original.calendarIntro;
    el('progress3').textContent=original.progress;el('bookButton').textContent='Solicitar cita';
    el('availabilityNotice').hidden=false;el('date').value='';show(1);el('demoStart').focus();
  }
  function slots(){
    resetSlot();const day=el('date').value;
    if(!day||day<mexicoDay()){el('calendarMessage').textContent='Selecciona hoy o una fecha posterior.';return;}
    // Explicitly illustrative schedule, not a claim about office opening hours.
    const choices=['09:00','10:30','12:00','16:00','17:30'].map(time=>({id:'DEMO-'+time,start:day+'T'+time+':00-06:00'})).filter(s=>new Date(s.start)>new Date());
    el('calendarMessage').textContent=choices.length?'Horarios ficticios · elige uno para continuar.':'No quedan horarios de ejemplo hoy. Selecciona una fecha posterior.';
    choices.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='slot';b.textContent=s.id.replace('DEMO-','');b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{slot=s;el('slots').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});el('selectionSummary').textContent='Ejemplo: '+format(s.start)+'. Sin reserva real.';el('selectionSummary').hidden=false;el('bookButton').disabled=false;});el('slots').append(b);});
  }
  el('demoStart').addEventListener('click',start);el('demoRestart').addEventListener('click',start);el('demoExit').addEventListener('click',exit);
  form.addEventListener('submit',e=>{if(!active)return;e.preventDefault();e.stopImmediatePropagation();if(!form.reportValidity())return;show(2);el('date').focus();},true);
  el('date').addEventListener('change',e=>{if(!active)return;e.stopImmediatePropagation();slots();},true);
  el('backButton').addEventListener('click',e=>{if(!active)return;e.stopImmediatePropagation();show(1);el('privacyConsent').focus();},true);
  el('bookButton').addEventListener('click',e=>{if(!active)return;e.stopImmediatePropagation();if(!slot)return;if(new Date(slot.start)<=new Date()){slots();return;}el('paymentSummary').textContent='Paciente de ejemplo · '+format(slot.start)+'. Valoración de endodoncia.';el('paymentMessage').textContent='';show(3);el('paymentHeading').focus();},true);
  el('paymentBack').addEventListener('click',()=>{show(2);el('date').focus();});
  el('simulatePayment').addEventListener('click',()=>{
    if(!active||!slot)return;
    if(el('paymentOutcome').value==='declined'){el('paymentMessage').textContent='Pago rechazado (simulación). No se cobró ni se reservó. Elige “Pago aprobado” para probar de nuevo.';return;}
    el('demoReceipt').textContent='Folio DEMO-0001 · '+format(slot.start)+'.';
    el('demoWhatsapp').textContent='Hola, Paciente de ejemplo. En este escenario hemos recibido tu solicitud para el '+format(slot.start)+'. Anticipo de ejemplo: $300 MXN. El consultorio revisará tu identificación y confirmará la cita. Este mensaje es solo una vista previa.';
    show(4);el('demoSuccessHeading').focus();
  });
  if(typeof API_BASE!=='undefined'&&API_BASE)el('demoStart').hidden=true;
  else if(new URLSearchParams(location.search).get('demo')==='1')start();
})();
