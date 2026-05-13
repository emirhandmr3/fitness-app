async function loadExercises(){ return fetch('data/exercises.json').then(r=>r.json()); }
async function loadMuscles(){ return fetch('data/muscles.json').then(r=>r.json()); }
const eqMap={barbell:'🏋️ Barbell',dumbbell:'🔩 Dumbbell',cable:'🧵 Cable',bodyweight:'🤸 Bodyweight',machine:'⚙️ Machine'};

async function initExerciseList(){
  const grid=document.getElementById('exerciseGrid'); if(!grid) return;
  const [exercises,muscles]=await Promise.all([loadExercises(), loadMuscles()]);
  const map=Object.fromEntries(muscles.map(m=>[m.slug,m.nameTr]));
  let state={category:'all',equipment:'all',type:'all',q:''};
  const render=()=>{
    const out=exercises.filter(e=>(state.category==='all'||e.category===state.category)&&(state.equipment==='all'||e.equipment===state.equipment)&&(state.type==='all'||e.type===state.type)&&normalizeText(`${e.nameTr} ${e.name}`).includes(normalizeText(state.q)));
    grid.innerHTML = out.map(e=>`<a class="card category-${e.category}" href="hareket-detay.html?slug=${e.slug}"><img loading="lazy" src="${e.image}" alt="${e.nameTr}" onerror="this.src='images/placeholder.svg'"/><h3>${e.nameTr}</h3><p><span class='badge'>${e.type}</span> <span class='badge'>${eqMap[e.equipment]}</span></p><p class='muted'>Primer: ${(e.primaryMuscles||[]).map(s=>map[s]||s).join(', ')}</p></a>`).join('') || '<p>Sonuç bulunamadı.</p>';
  };
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('active',x===b));render();}));
  document.getElementById('equipmentFilter').addEventListener('change',e=>{state.equipment=e.target.value;render();});
  document.getElementById('typeFilter').addEventListener('change',e=>{state.type=e.target.value;render();});
  document.getElementById('exerciseSearch').addEventListener('input',debounce(e=>{state.q=e.target.value;render();},200));
  render();
}

async function initExerciseDetail(){
  const wrap=document.getElementById('exerciseDetail'); if(!wrap) return;
  const [exercises,muscles]=await Promise.all([loadExercises(), loadMuscles()]);
  const map=Object.fromEntries(muscles.map(m=>[m.slug,m]));
  const e=exercises.find(x=>x.slug===getQueryParam('slug'));
  if(!e){wrap.innerHTML='<p>Hareket bulunamadı.</p>';return;}
  const list=(arr)=>arr.map(s=>`<a class='badge' href='kas-detay.html?slug=${s}'>${map[s]?.nameTr||s}</a>`).join(' ');
  wrap.innerHTML=`<img loading="lazy" src="${e.image}" alt="${e.nameTr}" style="max-height:500px;width:100%;object-fit:cover" onerror="this.src='images/placeholder.svg'"/>
  <h1>${e.nameTr}</h1><p><span class='badge'>${e.type}</span> <span class='badge'>${e.equipment}</span> <span class='badge'>${e.category}</span></p>
  <div class='info-grid grid-2'>
  <div class='card'><h3>Primer Kaslar</h3><p>${list(e.primaryMuscles)}</p></div>
  <div class='card'><h3>Sekonder Kaslar</h3><p>${list(e.secondaryMuscles)}</p></div>
  <div class='card'><h3>Hareket Düzlemi</h3><p>${e.movementPlane}</p></div>
  <div class='card'><h3>Eklem Hareketleri</h3><p>${e.jointActions}</p></div>
  <div class='alert alert-danger'>⚠️ <strong>Yaygın Hatalar:</strong> ${e.commonMistakes}</div>
  <div class='alert alert-success'>⬇️ <strong>Regresyon:</strong> ${e.regression}</div>
  <div class='alert alert-info'>⬆️ <strong>Progresyon:</strong> ${e.progression}</div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', ()=>{initExerciseList();initExerciseDetail();});
