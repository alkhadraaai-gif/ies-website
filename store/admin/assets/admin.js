// IES Store RFQ Admin – no inline scripts (CSP).
document.addEventListener('DOMContentLoaded', () => {
  const b = document.querySelector('.burger'), n = document.querySelector('.nav');
  if (b && n) b.addEventListener('click', () => { const o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  document.querySelectorAll('tr.rowlink').forEach(tr => tr.addEventListener('click', e => { if (!e.target.closest('a')) location.href = tr.dataset.href; }));
  document.querySelectorAll('form').forEach(f => f.addEventListener('submit', () => { const s = f.querySelector('button'); if (s) setTimeout(() => s.disabled = true, 0); }));
});
