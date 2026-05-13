(function(){
  const trMap = { 'ı':'i','İ':'i','ş':'s','Ş':'s','ğ':'g','Ğ':'g','ü':'u','Ü':'u','ö':'o','Ö':'o','ç':'c','Ç':'c' };
  window.normalizeText = (t='') => t.replace(/[ıİşŞğĞüÜöÖçÇ]/g, c => trMap[c] || c).toLowerCase();
  window.debounce = (fn, wait=200) => { let id; return (...args)=>{ clearTimeout(id); id=setTimeout(()=>fn(...args),wait); }; };
  window.getQueryParam = (k) => new URLSearchParams(window.location.search).get(k);

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const btn = document.getElementById('themeToggle');
    if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    document.getElementById('themeToggle')?.addEventListener('click', ()=> applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));
    document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('navLinks')?.classList.toggle('open'));
  });
})();
