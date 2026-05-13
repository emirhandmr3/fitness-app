async function loadMuscles(){ return fetch('data/muscles.json').then(r=>r.json()); }
async function loadExercises(){ return fetch('data/exercises.json').then(r=>r.json()); }

function muscleCard(m){
  return `<a class="card" href="kas-detay.html?slug=${m.slug}"><img loading="lazy" src="${m.image}" alt="${m.nameTr}" onerror="this.src='images/placeholder.svg'"/><h3>${m.nameTr}</h3><p class="muted">${m.nameLatin}</p><span class="badge">${m.region}</span></a>`;
}

function renderMuscleList(all, filtered){
  const el=document.getElementById('muscleGrid');
  el.innerHTML = filtered.map(muscleCard).join('') || '<p>Sonuç bulunamadı.</p>';
  document.getElementById('count').textContent = `${filtered.length} sonuç`;
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
  const related = exercises.filter(e=>e.primaryMuscles.includes(slug)||e.secondaryMuscles.includes(slug));
  container.innerHTML=`<img loading="lazy" src="${m.image}" alt="${m.nameTr}" style="max-height:500px;width:100%;object-fit:cover" onerror="this.src='images/placeholder.svg'"/>
  <h1>${m.nameTr} <span class="muted">(${m.nameLatin})</span></h1><span class="badge">${m.region}</span>
  <div class="info-grid grid-2">
  <div class="card"><h3>Kısa Açıklama</h3><p>${m.shortDescription}</p></div>
  <div class="card"><h3>Açıklama</h3><p>${m.description}</p></div>
  <div class="card"><h3>Fonksiyon</h3><p>${m.function}</p></div>
  <div class="card"><h3>Konum</h3><p>${m.location}</p></div>
  <div class="card"><h3>Yaygın Hareketler</h3><p>${m.commonExercises.map(s=>`<a class='badge' href='hareket-detay.html?slug=${s}'>${s}</a>`).join(' ')}</p></div></div>
  <h2 class="section-title">Bu kası çalıştıran hareketler</h2>
  <div class="grid grid-3">${related.map(e=>`<a class='card' href='hareket-detay.html?slug=${e.slug}'><img loading='lazy' src='${e.image}' onerror="this.src='images/placeholder.svg'" alt='${e.nameTr}'/><h3>${e.nameTr}</h3></a>`).join('') || '<p>İlişkili hareket yok.</p>'}</div>`;
}

document.addEventListener('DOMContentLoaded', ()=>{initMusclesPage();initMuscleDetail();});
