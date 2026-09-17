const WHATSAPP_NUMBER="522281104716";
const modal=document.getElementById("agentModal"), chatBody=document.getElementById("chatBody"), form=document.getElementById("chatForm"), input=document.getElementById("chatInput");
const handoff=document.getElementById("handoff"), waLink=document.getElementById("waLink"), handoffReason=document.getElementById("handoffReason"), levelText=document.getElementById("levelText");
const state={messages:[],profile:{name:"",phone:"",email:"",reason:"",appointmentDate:""}};
let busy=false;

function openAgent(){modal.classList.add("open");document.body.style.overflow="hidden";setTimeout(()=>input.focus(),80)}
function closeAgent(){modal.classList.remove("open");document.body.style.overflow=""}
document.querySelectorAll(".open-agent").forEach(b=>b.addEventListener("click",openAgent));
document.getElementById("closeAgent").addEventListener("click",closeAgent);
modal.addEventListener("click",e=>{if(e.target===modal)closeAgent()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))closeAgent()});
document.querySelectorAll("[data-msg]").forEach(b=>b.addEventListener("click",()=>sendMessage(b.dataset.msg)));

function addMessage(role,text){const div=document.createElement("div");div.className="msg "+role;div.textContent=text;chatBody.insertBefore(div,handoff);chatBody.scrollTop=chatBody.scrollHeight}
function setTyping(on){let el=document.getElementById("typing");if(on&&!el){el=document.createElement("div");el.id="typing";el.className="typing";el.textContent="Recepción está escribiendo…";chatBody.insertBefore(el,handoff)}else if(!on&&el)el.remove();chatBody.scrollTop=chatBody.scrollHeight}
function normalizeProfile(p){return {name:String(p?.name||"").slice(0,120),phone:String(p?.phone||"").slice(0,30),email:String(p?.email||"").slice(0,160),reason:String(p?.reason||"").slice(0,500),appointmentDate:String(p?.appointmentDate||"").slice(0,80)}}
function labelFor(data){const t=data.patientType==="appointment"?"Paciente con cita":data.patientType==="existing"?"Paciente existente":data.patientType==="new"?"Paciente nuevo":"Filtro activo";return data.level===4?"Prioridad alta · "+t:t}
function fallbackLocal(text){
  const low=text.toLowerCase();
  if(!state.profile.name && /^([a-záéíóúñü]+\s+){1,5}[a-záéíóúñü]+$/i.test(text.trim()) && !/(paciente|cita|dolor|urgencia)/i.test(text)) state.profile.name=text.trim();
  const phone=text.match(/(?:\+?52\s*)?(\d[\d\s()-]{8,18}\d)/); if(phone&&!state.profile.phone)state.profile.phone=phone[0].trim();
  if(!state.profile.reason && /(dolor|molestia|muela|diente|endodoncia|inflam|cita|reagendar|cancelar|seguimiento)/i.test(text))state.profile.reason=text.slice(0,500);
  const appointment=/(ya tengo cita|mi cita|reagendar|cambiar cita|cancelar cita)/i.test(low), existing=appointment||/(ya soy paciente|ya me atendieron)/i.test(low);
  const emergency=/(no puedo respirar|no puedo tragar|dificultad para respirar|dificultad para tragar|hinchaz[oó]n.*cuello|sangrado.*no para|desmayo|confusi[oó]n)/i.test(low);
  const urgent=emergency||/(dolor.*(muy fuerte|intenso)|fiebre|hinchaz[oó]n|inflamaci[oó]n|empeora)/i.test(low);
  const type=appointment?"appointment":existing?"existing":"new";
  const ready=Boolean(state.profile.name&&state.profile.phone&&(type!=="new"||state.profile.reason));
  let reply=!state.profile.name?"Claro. ¿Me compartes tu nombre completo?":!state.profile.phone?"¿Cuál es el número de WhatsApp donde puede contactarte el consultorio?":type==="new"&&!state.profile.reason?"Cuéntame brevemente qué te gustaría valorar o cuál es tu molestia principal.":ready?"Perfecto. Ya tengo lo necesario para pasar tu solicitud al consultorio.":"Cuéntame brevemente qué necesitas.";
  if(emergency)reply="Por lo que describes, busca atención médica u odontológica de urgencia de inmediato, especialmente si respirar o tragar se dificulta. No esperes una respuesta por WhatsApp para recibir atención.";
  return {reply,patientType:type,urgency:emergency?"emergency":urgent?"urgent":"routine",level:urgent?4:appointment?3:existing?2:1,handoff:ready,handoffReason:ready?"Datos mínimos de recepción completos.":"Faltan datos mínimos.",lead:{...state.profile},whatsappMessage:ready?`Hola, soy ${state.profile.name}. ${type==="appointment"?"Ya tengo una cita con la Dra. Jenny Morales.":type==="existing"?"Ya soy paciente de la Dra. Jenny Morales.":"Quisiera solicitar una valoración con la Dra. Jenny Morales."} Tel: ${state.profile.phone}. Motivo: ${state.profile.reason||"seguimiento"}.`:""};
}
async function sendMessage(text){
  text=String(text||"").trim();if(!text||busy)return;busy=true;input.value="";document.getElementById("quickChoices")?.remove();
  addMessage("user",text);state.messages.push({role:"user",content:text});setTyping(true);
  let data;
  try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:state.messages,profile:state.profile})});if(!r.ok)throw new Error("api");data=await r.json()}
  catch{data=fallbackLocal(text)}
  setTyping(false);state.profile=normalizeProfile(data.lead||state.profile);
  addMessage("assistant",data.reply||"Cuéntame un poco más para poder dirigir tu solicitud.");state.messages.push({role:"assistant",content:data.reply||""});state.messages=state.messages.slice(-16);
  levelText.textContent=labelFor(data);
  if(data.handoff&&data.whatsappMessage){handoff.classList.add("show");handoffReason.textContent=data.handoffReason||"Ya tenemos el contexto mínimo de tu solicitud.";waLink.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(data.whatsappMessage)}`}
  else handoff.classList.remove("show");
  busy=false;input.focus();chatBody.scrollTop=chatBody.scrollHeight;
}
form.addEventListener("submit",e=>{e.preventDefault();sendMessage(input.value)});

const loadVideoFromChunks=async(id,files)=>{
  try{
    const parts=await Promise.all(files.map(f=>fetch(f,{cache:"force-cache"}).then(r=>{if(!r.ok)throw new Error("video");return r.text()})));
    const v=document.getElementById(id);
    v.src="data:video/mp4;base64,"+parts.join("");
    v.muted=true;v.defaultMuted=true;v.volume=0;
    const p=v.play();if(p&&typeof p.catch==="function")p.catch(()=>{});
  }catch(e){console.warn("Hero video unavailable",e)}
};
loadVideoFromChunks("heroDesktop",["/media/hd01.txt","/media/hd02.txt","/media/hd03.txt","/media/hd04.txt","/media/hd05.txt","/media/hd06.txt"]);
loadVideoFromChunks("heroMobile",["/media/hm01.txt","/media/hm02.txt","/media/hm03.txt"]);

document.querySelectorAll(".hero-video").forEach(v=>{
  v.muted=true;v.defaultMuted=true;v.volume=0;v.removeAttribute("controls");
  v.addEventListener("volumechange",()=>{if(!v.muted||v.volume!==0){v.muted=true;v.volume=0}});
  const p=v.play();if(p&&typeof p.catch==="function")p.catch(()=>{});
});