const TABS=[["jobs","Jobs"],["side","Sidelines"],["skills","Skills"],["me","My Profile"],["arch","Architecture"]];
const skName=id=>(SK.find(s=>s[0]===id)||[0,id])[1];
const $=s=>document.querySelector(s);
const CSRF=document.querySelector('meta[name=csrf]').content;
let tab="jobs",q="",cat="All",P={saved:[],skills:{}},uname="",listBox;

function el(t,a={},...k){const e=document.createElement(t);for(const[x,v]of Object.entries(a)){if(x==="class")e.className=v;else if(x.startsWith("on"))e[x]=v;else e.setAttribute(x,v)}k.flat().forEach(c=>e.append(c));return e}
const tags=a=>a.map(t=>el("span",{class:"tag"},t));

/* ---- backend calls (api.php -> MySQL) ---- */
async function api(body){
  const r=await fetch("api.php",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF":CSRF},body:JSON.stringify(body)});
  if(r.status===401){location="login.php";return}
  if(!r.ok)throw new Error("Request failed");
}
async function toggleSave(id){
  const i=P.saved.indexOf(id);i<0?P.saved.push(id):P.saved.splice(i,1);render();
  try{await api({action:"toggle_save",item_id:id})}catch(e){alert("Could not save. Please try again.");load()}
}
async function setSkill(id,v){
  v?P.skills[id]=v:delete P.skills[id];render();
  try{await api({action:"set_skill",skill_id:id,status:v})}catch(e){alert("Could not save. Please try again.");load()}
}
async function load(){
  const r=await fetch("api.php");
  if(r.status===401){location="login.php";return}
  const d=await r.json();P={saved:d.saved,skills:d.skills};uname=d.username;render();
}

/* ---- views ---- */
function saveBtn(id){const on=P.saved.includes(id);return el("button",{class:"btn"+(on?"":" ghost"),onclick:()=>toggleSave(id)},on?"★ Saved":"☆ Save")}
function filterBar(cats){return el("div",{class:"bar"},
 el("input",{placeholder:"Search…",value:q,oninput:e=>{q=e.target.value;renderList()}}),
 cats?el("select",{onchange:e=>{cat=e.target.value;renderList()}},["All",...cats].map(c=>{const o=el("option",{value:c},c);if(c===cat)o.selected=true;return o})):"")}
const match=(...f)=>f.join(" ").toLowerCase().includes(q.toLowerCase());
function renderList(){
 listBox.replaceChildren();
 if(tab==="jobs")JOBS.filter(j=>(cat==="All"||j[2]===cat)&&match(j[1],j[3],j[4].map(skName).join(" "))).forEach(j=>
  listBox.append(el("div",{class:"card"},el("div",{class:"meta"},j[2]),el("h3",{},j[1]),el("p",{},j[3]),el("div",{},tags(j[4].map(skName))),el("div",{class:"meta"},"Typical PH monthly pay (rough estimate): "+j[5]),el("div",{class:"row"},saveBtn(j[0])))));
 if(tab==="side")SIDE.filter(s=>match(s[1],s[2],s[3].map(skName).join(" "))).forEach(s=>
  listBox.append(el("div",{class:"card"},el("h3",{},s[1]),el("p",{},s[2]),el("div",{},tags(s[3].map(skName))),el("p",{class:"meta"},"Tip: "+s[4]),el("div",{class:"row"},saveBtn(s[0])))));
 if(tab==="skills")SK.filter(s=>(cat==="All"||s[2]===cat)&&match(s[1],s[4])).forEach(s=>{
  const sel=el("select",{onchange:e=>setSkill(s[0],e.target.value)},[["","Not started"],["learning","Learning"],["have","I have this"]].map(([v,l])=>{const o=el("option",{value:v},l);if((P.skills[s[0]]||"")===v)o.selected=true;return o}));
  listBox.append(el("div",{class:"card"},el("div",{class:"meta"},s[2]+" · "+s[3]),el("h3",{},s[1]),el("p",{},s[4]),el("div",{class:"row"},sel)))});
 if(!listBox.children.length)listBox.append(el("p",{class:"note"},"Nothing matches your search."));
}
function viewMe(m){
 const have=Object.values(P.skills).filter(v=>v==="have").length,lrn=Object.values(P.skills).filter(v=>v==="learning").length;
 m.append(el("div",{class:"sec"},el("h2",{},"Hello, "+uname),el("p",{},`${P.saved.length} saved items · ${have} skills owned · ${lrn} in progress`),el("p",{class:"note"},"Stored in your MySQL account, so it follows you across devices.")));
 const jobs=JOBS.filter(j=>P.saved.includes(j[0])),box=el("div",{class:"sec"},el("h2",{},"Skill gap for your saved jobs"));
 if(!jobs.length)box.append(el("p",{class:"note"},"Save a job to see which skills you still need."));
 jobs.forEach(j=>{const got=j[4].filter(s=>P.skills[s]==="have").length,pct=Math.round(got/j[4].length*100),miss=j[4].filter(s=>P.skills[s]!=="have");
  box.append(el("div",{style:"margin-bottom:14px"},el("strong",{},j[1]+" — "+pct+"% ready"),el("div",{class:"bar2"},el("i",{style:"width:"+pct+"%"})),el("div",{class:"note"},miss.length?"Missing: "+miss.map(skName).join(", "):"You have every listed skill!")))});
 m.append(box);
 const sd=SIDE.filter(s=>P.saved.includes(s[0]));
 m.append(el("div",{class:"sec"},el("h2",{},"Saved sidelines"),sd.length?el("div",{},sd.map(s=>el("p",{},"• "+s[1]+" — needs "+s[3].map(skName).join(", ")))):el("p",{class:"note"},"No sidelines saved yet.")));
}
function viewArch(m){
 const B=(x,y,w,h,t,s)=>`<rect class="b" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text class="h" x="${x+w/2}" y="${y+24}" text-anchor="middle">${t}</text><text class="s" x="${x+w/2}" y="${y+42}" text-anchor="middle">${s}</text>`;
 const A=d=>`<path class="l" d="${d}" marker-end="url(#ar)"/>`;
 const svg=`<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System architecture diagram"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7F8C8D"/></marker></defs>
 <text class="s" x="10" y="16">CLIENT (browser)</text>${B(20,24,200,60,"Design layer","style.css · index.php shell")}${B(260,24,200,60,"UI logic","app.js · catalog.js")}${B(500,24,180,60,"Login page","login.php form")}
 <text class="s" x="10" y="124">SERVER (PHP on Apache)</text>${B(20,132,200,60,"auth","login.php · logout.php")}${B(260,132,200,60,"api.php","JSON endpoint + CSRF")}${B(500,132,180,60,"config.php","PDO · sessions")}
 <text class="s" x="10" y="232">DATABASE (MySQL)</text>${B(20,240,200,60,"users","id · email · password_hash")}${B(260,240,200,60,"saved_items","user_id · item_id")}${B(500,240,180,60,"user_skills","user_id · skill · status")}
 ${B(230,332,240,52,"phpMyAdmin","manage tables and import SQL")}
 ${A("M590 84V110H120V132")}${A("M360 84V132")}${A("M220 162H260")}${A("M120 192V240")}${A("M360 192V240")}${A("M590 192V240")}${A("M350 332V300")}
 </svg>`;
 const d=el("div",{class:"sec diagram"});d.innerHTML=svg;
 m.append(el("div",{class:"sec"},el("h2",{},"System architecture")),d);
 m.append(el("div",{class:"sec"},el("h2",{},"Application flow"),el("ol",{},
  [["Visit.","Opening index.php without a session redirects to login.php."],
   ["Register or sign in.","login.php validates the form, checks the CSRF token, then hashes the password on sign-up or verifies it on login. Every query uses prepared statements."],
   ["Session.","On success PHP starts a session, stores the user ID, and redirects to index.php, which serves the page shell and loads style.css, catalog.js and app.js."],
   ["Load profile.","app.js calls api.php (GET). The server reads saved_items and user_skills for the logged-in user ID only and returns JSON."],
   ["Browse.","Jobs, sidelines and skills come from catalog.js. Search and filters run in the browser."],
   ["Save changes.","Saving a job or setting a skill sends a POST to api.php with a CSRF header. The server validates the input and inserts, updates or deletes rows in MySQL."],
   ["Analyze.","My Profile compares saved jobs with skills marked as owned and shows readiness and gaps."],
   ["Log out.","logout.php destroys the session and returns to login.php. You can inspect or edit all data in phpMyAdmin."]].map(([a,b])=>el("li",{},el("strong",{},a+" "),b)))));
}
function render(){
 $("#nav").replaceChildren(...TABS.map(([k,l])=>el("button",{class:k===tab?"on":"",onclick:()=>{tab=k;q="";cat="All";render()}},l)));
 const m=$("#main");m.replaceChildren();
 if(tab==="me")return viewMe(m);
 if(tab==="arch")return viewArch(m);
 const cats=tab==="jobs"?[...new Set(JOBS.map(j=>j[2]))]:tab==="skills"?[...new Set(SK.map(s=>s[2]))]:null;
 m.append(filterBar(cats));listBox=el("div",{class:"grid"});m.append(listBox);renderList();
}
render();load();
