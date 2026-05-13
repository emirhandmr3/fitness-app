async function loadMuscles(){ return fetch('data/muscles.json').then(r=>r.json()); }
async function loadExercises(){ return fetch('data/exercises.json').then(r=>r.json()); }

const getCustomMuscleImage = (slug, fallback) => localStorage.getItem(`muscle_image_${slug}`) || fallback;
const getCustomExerciseImage = (slug, fallback) => localStorage.getItem(`exercise_image_${slug}`) || fallback;

function muscleCard(m){
  const image = getCustomMuscleImage(m.slug, m.image);
  return `<a class="card" href="kas-detay.html?slug=${m.slug}"><img loading="lazy" src="${image}" alt="${m.nameTr}" onerror="this.src='images/placeholder.svg'"/><h3>${m.nameTr}</h3><p class="muted">${m.nameLatin}</p><span class="badge">${m.region}</span></a>`;
}

function renderMuscleList(all, filtered){
  const el=document.getElementById('muscleGrid');
  el.innerHTML = filtered.map(muscleCard).join('') || '<p>Sonuç bulunamadı.</p>';
  document.getElementById('count').textContent = `${filtered.length} sonuç`;
}

function buildImageEditor({ key, currentImage, onPreview, onSave }) {
  return `<div id="imageEditor" class="card" style="margin-top:12px">
    <h3>Görseli Düzenle</h3>
    <input id="imageUrlInput" value="${currentImage}" placeholder="https://..." style="width:100%;margin-bottom:10px" />
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button id="previewImageBtn" class="btn">Önizle</button>
      <button id="saveImageBtn" class="btn btn-primary">Kaydet</button>
      <button id="cancelImageBtn" class="btn btn-secondary">İptal</button>
    </div>
  </div>`;
}

function wireImageEditor({ scopeEl, storageKey, imageEl, defaultImage }) {
  const editBtn = scopeEl.querySelector('#editImageBtn');
  editBtn?.addEventListener('click', () => {
    if (scopeEl.querySelector('#imageEditor')) return;
    scopeEl.insertAdjacentHTML('beforeend', buildImageEditor({ currentImage: imageEl.src }));
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

async function initMusclesPage(){
  if(!document.getElementById('muscleGrid')) return;
  const muscles = await loadMuscles();
  let region = getQueryParam('bolge') || 'all';
  let q='';
  const apply=()=>{
    const out=muscles.filter(m=> (region==='all' || normalizeText(m.region)===region) && (normalizeText(m.nameTr).includes(normalizeText(q)) || normalizeText(m.nameLatin).includes(normalizeText(q))));
    renderMuscleList(muscles,out);
    document.querySelectorAll('[data-region]').forEach(b=>b.classList.toggle('active', b.dataset.region===region));
  };
  document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{region=b.dataset.region;apply();}));
  document.getElementById('search')?.addEventListener('input', debounce((e)=>{q=e.target.value;apply();},200));
  apply();
}

async function initMuscleDetail(){
  const container=document.getElementById('muscleDetail'); if(!container) return;
  const [muscles, exercises] = await Promise.all([loadMuscles(), loadExercises()]);
  const slug=getQueryParam('slug'); const m=muscles.find(x=>x.slug===slug);
  if(!m){container.innerHTML='<p>Kas bulunamadı.</p>';return;}
  const image = getCustomMuscleImage(m.slug, m.image);
  const related = exercises.filter(e=>e.primaryMuscles.includes(slug)||e.secondaryMuscles.includes(slug));
  container.innerHTML=`<div style="position:relative"><img id="detailImage" loading="lazy" src="${image}" alt="${m.nameTr}" style="max-height:500px;width:100%;object-fit:cover" onerror="this.src='images/placeholder.svg'"/><button id="editImageBtn" class="btn" style="position:absolute;top:12px;right:12px;padding:6px 10px">✏️</button></div>
  <h1>${m.nameTr} <span class="muted">(${m.nameLatin})</span></h1><span class="badge">${m.region}</span>
  <div class="info-grid grid-2">
  <div class="card"><h3>Kısa Açıklama</h3><p>${m.shortDescription}</p></div>
  <div class="card"><h3>Açıklama</h3><p>${m.description}</p></div>
  <div class="card"><h3>Fonksiyon</h3><p>${m.function}</p></div>
  <div class="card"><h3>Konum</h3><p>${m.location}</p></div>
  <div class="card"><h3>Yaygın Hareketler</h3><p>${m.commonExercises.map(s=>`<a class='badge' href='hareket-detay.html?slug=${s}'>${s}</a>`).join(' ')}</p></div></div>
  <h2 class="section-title">Bu kası çalıştıran hareketler</h2>
  <div class="grid grid-3">${related.map(e=>`<a class='card' href='hareket-detay.html?slug=${e.slug}'><img loading='lazy' src='${getCustomExerciseImage(e.slug, e.image)}' onerror="this.src='images/placeholder.svg'" alt='${e.nameTr}'/><h3>${e.nameTr}</h3></a>`).join('') || '<p>İlişkili hareket yok.</p>'}</div>`;

  wireImageEditor({
    scopeEl: container,
    storageKey: `muscle_image_${m.slug}`,
    imageEl: container.querySelector('#detailImage'),
    defaultImage: m.image
  });
}

document.addEventListener('DOMContentLoaded', ()=>{initMusclesPage();initMuscleDetail();});
