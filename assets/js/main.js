// Al-Khadraa IES — site behaviour
(function () {
  // mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // industry tabs
  var tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null, rtl = document.dir === 'rtl';
      if (k === 'ArrowRight') n = tabs[(i + (rtl ? -1 : 1) + tabs.length) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i + (rtl ? 1 : -1) + tabs.length) % tabs.length];
      if (n) { n.focus(); select(n); e.preventDefault(); }
    });
  });
  function select(t) {
    tabs.forEach(function (o) {
      var on = o === t;
      o.setAttribute('aria-selected', on ? 'true' : 'false');
      o.tabIndex = on ? 0 : -1;
      var p = document.getElementById(o.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
  }

  // project filter
  var fbtns = document.querySelectorAll('.fbtn');
  var cards = document.querySelectorAll('.pc');
  var count = document.querySelector('.count');
  function upd(f) {
    var n = 0;
    cards.forEach(function (c) { var show = f === 'all' || c.dataset.sector === f; c.hidden = !show; if (show) n++; });
    fbtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false'); });
    if (count) count.textContent = count.dataset.tpl.replace('{n}', n);
  }
  fbtns.forEach(function (b) { b.addEventListener('click', function () { upd(b.dataset.f); }); });
  if (fbtns.length) upd('all');

  // contact form -> email draft (no server needed)
  var form = document.getElementById('rfq');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subj = (form.dataset.subject || 'RFQ') + ' — ' + (d.get('company') || d.get('name') || '');
      var body = [
        'Name: ' + (d.get('name') || ''),
        'Company: ' + (d.get('company') || ''),
        'Email: ' + (d.get('email') || ''),
        'Phone: ' + (d.get('phone') || ''),
        'Scope: ' + (d.get('scope') || ''),
        '',
        d.get('details') || ''
      ].join('\n');
      window.location.href = 'mailto:info@ies-iraq.com?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    });
  }

  // reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  // year
  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
