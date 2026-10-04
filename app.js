const $=id=>document.getElementById(id);
const defaults=['English','Hindi','Gujarati','Mathematics','Science','Social Science','History','Geography','Computer','Sanskrit','General Knowledge'];
let state;try{state=JSON.parse(localStorage.getItem('studyBuddyMerged')||'null')}catch(e){}
if(!state)state={subjects:defaults.map((name,i)=>({id:i+1,name})),tasks:[],notes:[],streak:0,lastDone:''};
state.subjects ||= defaults.map((name,i)=>({id:i+1,name}));state.tasks ||= [];state.notes ||= [];state.streak ||= 0;state.lastDone ||= '';
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function save(){localStorage.setItem('studyBuddyMerged',JSON.stringify(state));render()}
function showPage(p){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page===p))}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$('subjectForm').onsubmit=e=>{e.preventDefault();let name=$('subjectInput').value.trim();if(name&&!state.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase()))state.subjects.push({id:Date.now(),name});$('subjectInput').value='';save()};
window.removeSubject=id=>{state.subjects=state.subjects.filter(s=>s.id!==id);state.tasks.forEach(t=>{if(t.subjectId===id)t.subjectId=null});save()};
$('taskForm').onsubmit=e=>{e.preventDefault();state.tasks.push({id:Date.now(),text:$('taskInput').value.trim(),subjectId:Number($('taskSubject').value)||null,due:$('taskDue').value,done:false});$('taskInput').value='';$('taskDue').value='';save()};
window.toggleTask=id=>{let t=state.tasks.find(t=>t.id===id);if(!t)return;t.done=!t.done;if(t.done){let d=new Date().toLocaleDateString('en-CA');if(state.lastDone!==d){state.streak++;state.lastDone=d}}save()};
window.deleteTask=id=>{state.tasks=state.tasks.filter(t=>t.id!==id);save()};
$('saveNote').onclick=()=>{let text=$('noteText').value.trim();if(!text)return;state.notes.unshift({id:Date.now(),title:$('noteTitle').value.trim()||'Untitled',text});$('noteTitle').value='';$('noteText').value='';save()};
window.deleteNote=id=>{state.notes=state.notes.filter(n=>n.id!==id);save()};
function render(){let done=state.tasks.filter(t=>t.done).length,total=state.tasks.length,pct=total?Math.round(done/total*100):0;
$('subjectCount').textContent=state.subjects.length+' subjects';$('progressText').textContent=pct+'% complete';$('progressBar').style.width=pct+'%';$('taskSummary').textContent=`${done} of ${total} tasks completed`;$('streak').textContent=state.streak+' day'+(state.streak===1?'':'s');
$('subjectList').innerHTML=state.subjects.map(s=>`<div class="subject"><span>📘 ${esc(s.name)}</span><button class="delete" onclick="removeSubject(${s.id})" aria-label="Remove ${esc(s.name)}">Remove</button></div>`).join('');
$('taskSubject').innerHTML='<option value="">No subject</option>'+state.subjects.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
$('taskList').innerHTML=state.tasks.map(t=>{let sub=state.subjects.find(s=>s.id===t.subjectId);return `<li class="task ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.id})"><div class="task-info"><span>${esc(t.text)}</span><small>${sub?esc(sub.name):'General'}${t.due?' • Due '+esc(t.due):''}</small></div><button class="delete" onclick="deleteTask(${t.id})">Delete</button></li>`}).join('');
$('notesList').innerHTML=state.notes.map(n=>`<div class="note"><h3>${esc(n.title)}</h3><p>${esc(n.text).replace(/\n/g,'<br>')}</p><button class="delete" onclick="deleteNote(${n.id})">Delete</button></div>`).join('');
$('bookLinks').innerHTML=state.subjects.slice(0,11).map(s=>`<a target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(s.name+' class 8 textbook study material')}">${esc(s.name)} resources ↗</a>`).join('')}
document.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>{$('quizResult').textContent=b.dataset.answer==='56'?'✅ Correct!':'↻ Try again.'});
let seconds=1500,running=false,interval;
function paintTimer(){$('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
$('timerBtn').onclick=()=>{running=!running;$('timerBtn').textContent=running?'Pause focus':'Start focus';if(running)interval=setInterval(()=>{seconds--;paintTimer();if(seconds<=0){clearInterval(interval);running=false;$('timerBtn').textContent='Start focus';if('Notification'in window&&Notification.permission==='granted')new Notification('Study Buddy',{body:'Focus session complete! Take a short break.'})}},1000);else clearInterval(interval)};
$('resetTimer').onclick=()=>{clearInterval(interval);running=false;seconds=1500;paintTimer();$('timerBtn').textContent='Start focus'};
$('notifyBtn').onclick=async()=>{if(!('Notification'in window)){alert('Notifications are not supported in this browser.');return}let p=await Notification.requestPermission();$('notifyBtn').textContent=p==='granted'?'🔔 Reminders on':'🔔 Reminders'};
let deferredPrompt;$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});render();