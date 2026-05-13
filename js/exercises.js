async function loadExercises(){ return fetch('data/exercises.json').then(r=>r.json()); }
async function loadMuscles(){ return fetch('data/muscles.json').then(r=>r.json()); }
const eqMap={"barbell":'🏋️ Barbell',"dumbbell":'🔩 Dumbbell',"kablo":'🧵 Kablo',"vücut ağırlığı":'🤸 Vücut Ağırlığı',"makine":'⚙️ Makine'};
const getCustomExerciseImage = (slug, fallback) => localStorage.getItem(`exercise_image_${slug}`) || fallback;
const getCustomMuscleImage = (slug, fallback) => localStorage.getItem(`muscle_image_${slug}`) || fallback;

function wireImageEditor({ scopeEl, storageKey, imageEl, defaultImage }) {
  const editBtn = scopeEl.querySelector('#editImageBtn');
  editBtn?.addEventListener('click', () => {
    if (scopeEl.querySelector('#imageEditor')) return;
    scopeEl.insertAdjacentHTML('beforeend', `<div id="imageEditor" class="card" style="margin-top:12px"><h3>Görseli Düzenle</h3><input id="imageUrlInput" value="${imageEl.src}" placeholder="https://..." style="width:100%;margin-bottom:10px" /><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="previewImageBtn" class="btn">Önizle</button><button id="saveImageBtn" class="btn btn-primary">Kaydet</button><button id="cancelImageBtn" class="btn btn-secondary">İptal</button></div></div>`);
    const input = scopeEl.querySelector('#imageUrlInput');
    scopeEl.querySelector('#previewImageBtn')?.addEventListener('click', () => {
      const next = input.value.trim();
      if (next) imageEl.src = next;
    });
    scopeEl.querySelector('#saveImageBtn')?.addEventListener('click', () => {
      const next = input.value.trim();
      if (!next) return;
      localStorage.setItem(storageKey, next);
      imageEl.src = next;
      scopeEl.querySelector('#imageEditor')?.remove();
    });
    scopeEl.querySelector('#cancelImageBtn')?.addEventListener('click', () => {
      imageEl.src = localStorage.getItem(storageKey) || defaultImage;
      scopeEl.querySelector('#imageEditor')?.remove();
    });
  });
}

async function initExerciseList(){
  const grid=document.getElementById('exerciseGrid'); if(!grid) return;
  const [exercises,muscles]=await Promise.all([loadExercises(), loadMuscles()]);
  const map=Object.fromEntries(muscles.map(m=>[m.slug,m.nameTr]));
  let state={category:'all',equipment:'all',type:'all',q:''};
  const render=()=>{
    const out=exercises.filter(e=>(state.category==='all'||e.category===state.category)&&(state.equipment==='all'||e.equipment===state.equipment)&&(state.type==='all'||e.type===state.type)&&normalizeText(`${e.nameTr} ${e.name}`).includes(normalizeText(state.q)));
    grid.innerHTML = out.map(e=>`<a class="card category-${e.category}" href="hareket-detay.html?slug=${e.slug}"><img loading="lazy" src="${getCustomExerciseImage(e.slug, e.image)}" alt="${e.nameTr}" onerror="this.src='images/placeholder.svg'"/><h3>${e.nameTr}</h3><p><span class='badge'>${e.type}</span> <span class='badge'>${eqMap[e.equipment]||e.equipment}</span></p><p class='muted'>Primer: ${(e.primaryMuscles||[]).map(s=>map[s]||s).join(', ')}</p></a>`).join('') || '<p>Sonuç bulunamadı.</p>';
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
  wrap.innerHTML=`<div style="position:relative"><img id="detailImage" loading="lazy" src="${getCustomExerciseImage(e.slug, e.image)}" alt="${e.nameTr}" style="max-height:500px;width:100%;object-fit:cover" onerror="this.src='images/placeholder.svg'"/><button id="editImageBtn" class="btn" style="position:absolute;top:12px;right:12px;padding:6px 10px">✏️</button></div>
  <h1>${e.nameTr}</h1><p><span class='badge'>${e.type}</span> <span class='badge'>${e.equipment}</span> <span class='badge'>${e.muscleGroup}</span> <span class='badge'>${e.difficulty}</span></p>
  <div class='info-grid grid-2'>
  <div class='card'><h3>Açıklama</h3><p>${e.description}</p></div>
  <div class='card'><h3>Primer Kaslar</h3><p>${list(e.primaryMuscles)}</p></div>
  <div class='card'><h3>Sekonder Kaslar</h3><p>${list(e.secondaryMuscles)}</p></div>
  <div class='card'><h3>Uygulama Adımları</h3><ol>${e.howTo.map(s=>`<li>${s}</li>`).join('')}</ol></div>
  <div class='card'><h3>İpuçları</h3><ul>${e.tips.map(s=>`<li>${s}</li>`).join('')}</ul></div>
  <div class='alert alert-danger'>⚠️ <strong>Yaygın Hatalar:</strong> ${e.commonMistakes.join(', ')}</div>
  </div>`;

  wireImageEditor({ scopeEl: wrap, storageKey: `exercise_image_${e.slug}`, imageEl: wrap.querySelector('#detailImage'), defaultImage: e.image });
}

document.addEventListener('DOMContentLoaded', ()=>{initExerciseList();initExerciseDetail();});
