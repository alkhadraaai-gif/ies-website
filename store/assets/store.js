/* IES Store — Phase 1 (quote-only). Vanilla JS, no external libraries. */
(function () {
  'use strict';
  var AR = document.documentElement.lang === 'ar';
  var BASE = document.body.getAttribute('data-store-base') || '';
  var LIVE = /(^|\.)al-khadraa\.com$/.test(location.hostname);
  var EMAIL = 'info@ies-iraq.com', WA = '9647903435616';

  var S = {
    en: {
      stock: 'In stock · Baghdad', supmea: 'Supmea instruments', source: 'Legacy DCS / PLC spares', brand: 'Brand', srcAvail: 'Sourced on request · 1–3 weeks', ds: 'Datasheet (PDF)', indep: 'Supplied from independent stock, not as manufacturer-authorised supply. Condition (new surplus / refurbished), test report and IES warranty are stated in the quotation.',
      inStock: 'In stock', avail: '{n} available', import: 'Import · {w} weeks', onReq: 'On request',
      add: 'Add to RFQ', added: 'Added', results: '{n} items', none: 'No items match your search.',
      noneHint: 'Send the part number anyway — we source legacy and hard-to-find parts.', reqThis: 'Request “{q}”',
      clear: 'Clear filters', more: 'Show more', cat: 'Category', cond: 'Condition', life: 'Lifecycle', mfr: 'Manufacturer',
      fam: 'Product family', new: 'New', used: 'Used / old stock', ref: 'Refurbished',
      active: 'Active', phase: 'Phase-out', disc: 'Discontinued', tbc: 'Lifecycle TBC',
      sRel: 'Best match', sPn: 'Part number A–Z', sQty: 'Most available',
      details: 'Details', coo: 'Country of origin', hs: 'HS code', code: 'IES item code', succ: 'Successor', qty: 'Quantity', uom: 'Unit',
      configure: 'Configure & add', range: 'Range / size', out: 'Output', conn: 'Process connection', notes: 'Notes (medium, temperature, quantity of tags…)',
      dn: 'Nominal size (e.g. DN80)', prange: 'Pressure range (e.g. 0–10 bar)',
      cfgNote: 'Final order code and datasheet are confirmed by IES engineers in the quotation.',
      eval: 'Evaluated by IES', lead: 'Lead time', weeks: '{w} weeks', price: 'Price', onQuote: 'In quotation',
      famAll: 'All', flow: 'Flow', level: 'Level', press: 'Pressure', temp: 'Temperature', anal: 'Water analysis', rec: 'Recorders',
      supNote: 'Supmea process instruments are imported to order for IES projects and customers in Iraq. Choose the options you know; leave the rest to our engineers.',
      cart: 'Your RFQ', cartEmpty: 'Your RFQ is empty. Add items from stock, configure a Supmea instrument or paste part numbers.',
      browse: 'Browse stock', lineNote: 'Note for this line (optional)', company: 'Company *', name: 'Contact name *', phone: 'Phone / WhatsApp *', email: 'Email',
      city: 'Delivery city', proj: 'Project / PO reference', date: 'Required by', msg: 'Message',
      send: 'Send RFQ', sending: 'Sending…', viaEmail: 'Email', viaWa: 'WhatsApp', csv: 'Download (CSV)',
      reply: 'IES engineers reply with a quotation within one working day (Saturday–Thursday).',
      need: 'Please fill company, contact name and phone.', okLive: 'RFQ {id} received. A confirmation goes to your email if given; we will reply within one working day.',
      okTest: 'RFQ {id} prepared. Your email app opens with the full RFQ — press Send. You can also send it on WhatsApp.',
      fail: 'Could not reach the server — please send by email or WhatsApp below.',
      bomPh: '6ES7 315-2EH14-0AB0   2\nIC697CPU731, 1\nCC-PAIH01 51405038-175 x3\n…one part number per line, quantity optional',
      check: 'Check & add to RFQ', found: 'in IES stock', toSource: 'added for sourcing', lines: '{a} lines added: {b} from stock, {c} for sourcing.',
      toast: '{pn} added to RFQ', remove: 'Remove', items: 'items', view: 'View', grid: 'Grid', list: 'List', filters: 'Filters',
      sourcing: 'Sourcing', supTag: 'Supmea', stkTag: 'Stock', share: 'Copy link', copied: 'Link copied'
    },
    ar: {
      stock: 'متوفر في مخزن بغداد', supmea: 'أجهزة Supmea', source: 'قطع غيار DCS / PLC القديمة', brand: 'العلامة التجارية', srcAvail: 'يُوفَّر حسب الطلب · 1–3 أسابيع', ds: 'ورقة المواصفات (PDF)', indep: 'تُجهَّز من مخزون مستقل وليس كتوريد معتمد من الشركة المصنعة. تُذكر الحالة (جديد فائض / مجدد) وتقرير الفحص وضمان IES في عرض السعر.',
      inStock: 'متوفر', avail: 'متوفر {n}', import: 'استيراد · {w} أسابيع', onReq: 'حسب الطلب',
      add: 'أضف إلى طلب التسعير', added: 'تمت الإضافة', results: '{n} مادة', none: 'لا توجد مواد مطابقة لبحثك.',
      noneHint: 'أرسل رقم القطعة على أي حال — نوفّر القطع القديمة والنادرة.', reqThis: 'اطلب «{q}»',
      clear: 'مسح الفلاتر', more: 'عرض المزيد', cat: 'الفئة', cond: 'الحالة', life: 'دورة حياة المنتج', mfr: 'الشركة المصنعة',
      fam: 'عائلة المنتج', new: 'جديد', used: 'مستعمل / مخزون قديم', ref: 'مجدد',
      active: 'فعال', phase: 'قيد الإيقاف', disc: 'متوقف إنتاجه', tbc: 'دورة الحياة قيد التأكيد',
      sRel: 'الأكثر تطابقاً', sPn: 'رقم القطعة أ–ي', sQty: 'الأكثر توفراً',
      details: 'التفاصيل', coo: 'بلد المنشأ', hs: 'رمز HS', code: 'رمز المادة في IES', succ: 'البديل', qty: 'الكمية', uom: 'الوحدة',
      configure: 'اختر المواصفات وأضف', range: 'المدى / القياس', out: 'الإشارة الخارجة', conn: 'التوصيل', notes: 'ملاحظات (المادة المقاسة، الحرارة، عدد الأجهزة…)',
      dn: 'القطر الاسمي (مثال DN80)', prange: 'مدى الضغط (مثال 0–10 bar)',
      cfgNote: 'يؤكد مهندسو IES رمز الطلب النهائي وورقة المواصفات في عرض السعر.',
      eval: 'مُقيَّم من IES', lead: 'مدة التوريد', weeks: '{w} أسابيع', price: 'السعر', onQuote: 'ضمن عرض السعر',
      famAll: 'الكل', flow: 'الجريان', level: 'المنسوب', press: 'الضغط', temp: 'الحرارة', anal: 'تحليل المياه', rec: 'المسجلات',
      supNote: 'تُستورد أجهزة Supmea حسب الطلب لمشاريع وزبائن IES في العراق. اختر ما تعرفه من المواصفات واترك الباقي لمهندسينا.',
      cart: 'طلب التسعير', cartEmpty: 'طلبك فارغ. أضف مواد من المخزن أو اختر جهاز Supmea أو الصق أرقام القطع.',
      browse: 'تصفح المخزن', lineNote: 'ملاحظة لهذا البند (اختياري)', company: 'الشركة *', name: 'اسم الشخص المسؤول *', phone: 'الهاتف / واتساب *', email: 'البريد الإلكتروني',
      city: 'مدينة التسليم', proj: 'المشروع / رقم أمر الشراء', date: 'مطلوب قبل', msg: 'رسالة',
      send: 'أرسل طلب التسعير', sending: 'جارٍ الإرسال…', viaEmail: 'بريد', viaWa: 'واتساب', csv: 'تنزيل (CSV)',
      reply: 'يرد مهندسو IES بعرض سعر خلال يوم عمل واحد (السبت–الخميس).',
      need: 'يرجى إدخال الشركة واسم الشخص والهاتف.', okLive: 'تم استلام الطلب {id}. سنرد خلال يوم عمل واحد.',
      okTest: 'تم تجهيز الطلب {id}. سيفتح برنامج البريد مع تفاصيل الطلب — اضغط إرسال. ويمكنك إرساله عبر واتساب أيضاً.',
      fail: 'تعذر الاتصال بالخادم — يرجى الإرسال بالبريد أو واتساب أدناه.',
      bomPh: '6ES7 315-2EH14-0AB0   2\nIC697CPU731, 1\nCC-PAIH01 51405038-175 x3\n…رقم قطعة في كل سطر، والكمية اختيارية',
      check: 'تحقق وأضف إلى الطلب', found: 'متوفر في مخزن IES', toSource: 'أضيف للتوفير', lines: 'أضيف {a} بنود: {b} من المخزن و{c} للتوفير.',
      toast: 'أضيف {pn} إلى الطلب', remove: 'حذف', items: 'مواد', view: 'العرض', grid: 'شبكة', list: 'قائمة', filters: 'الفلاتر',
      sourcing: 'توفير', supTag: 'Supmea', stkTag: 'مخزن', share: 'نسخ الرابط', copied: 'تم نسخ الرابط'
    }
  }[AR ? 'ar' : 'en'];
  var CATN = AR ? {plc:'PLC ومتحكمات',rio:'وحدات I/O عن بعد',hmi:'شاشات HMI',psu:'مجهزات قدرة',net:'اتصالات وشبكات',inst:'أجهزة القياس',fire:'إنذار الحريق',bms:'أنظمة BMS',knx:'KNX',lv:'معدات الجهد المنخفض',acc:'ملحقات',oth:'أخرى',dcs:'وحدات DCS',sis:'أنظمة السلامة (SIS / F&G)',tur:'تحكم التوربينات والمولدات',vib:'مراقبة الاهتزاز',drv:'المحركات والإلكترونيات القدرة'}
    : {plc:'PLC & controllers',rio:'Remote I/O',hmi:'HMI panels',psu:'Power supplies',net:'Network & comms',inst:'Process instruments',fire:'Fire alarm',bms:'BMS / building automation',knx:'KNX',lv:'LV controls',acc:'Accessories',oth:'Other',dcs:'DCS modules',sis:'Safety systems (SIS / F&G)',tur:'Turbine & generator control',vib:'Vibration monitoring',drv:'Drives & power electronics'};
  var ICON = {
    plc:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h2M7 12h2M7 16h2M13 8h4M13 12h4M13 16h4"/>',
    rio:'<rect x="2" y="6" width="5" height="12" rx="1"/><rect x="9.5" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/>',
    hmi:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    psu:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    net:'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v5M12 12.5 6.5 17M12 12.5l5.5 4.5"/>',
    inst:'<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M12 3v2"/>',
    fire:'<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 2 3 3 3 5 0-3 0-6 0-8z"/>',
    bms:'<path d="M3 21V9l9-6 9 6v12z"/><path d="M9 21v-6h6v6"/>',
    knx:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9v6M9 12l5-3M11 12l4 3"/>',
    lv:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M12 8v8"/>',
    acc:'<path d="M14 7l3-3 3 3-3 3M17 4v0M4 20l9-9"/><circle cx="6" cy="18" r="2"/>',
    oth:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    flow:'<path d="M3 9h12a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>',
    level:'<path d="M5 3v18h14V3"/><path d="M5 13c2-1.5 4-1.5 7 0s5 1.5 7 0"/>',
    press:'<circle cx="12" cy="12" r="9"/><path d="M12 12l5-5M7 16h10"/>',
    temp:'<path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z"/>',
    anal:'<path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-10V3"/>',
    rec:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M6 14l3-4 3 3 3-5 3 4"/>',
    dcs:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/>',
    sis:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
    tur:'<circle cx="12" cy="12" r="2"/><path d="M12 10C12 5 15 3 17 4M14 12c5 0 7 3 6 5M12 14c0 5-3 7-5 6M10 12c-5 0-7-3-6-5"/>',
    vib:'<path d="M2 12h3l2-6 3 12 3-9 2 5 2-2h5"/>',
    drv:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M8 7h8"/>',
    src:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.5-4.5"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[k] || ICON.oth) + '</svg>'; }
  function T(k, o) { var s = S[k] || k; if (o) for (var p in o) s = s.split('{' + p + '}').join(o[p]); return s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[\s\-_.\/]/g, ''); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var store = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  var DATA = { stock: [], supmea: [], sourcing: [] };
  var st = { src: 'stock', q: '', sf: { b: {}, c: {} }, slimit: 24, f: { cat: {}, cond: {}, life: {} }, fam: 'all', sort: 'rel', view: store.get('ies_store_view', 'grid'), limit: 24 };
  var cart = store.get('ies_rfq', []);

  /* ---------- search ---------- */
  function score(it, q, nq) {
    if (!q) return 1;
    var pn = norm(it.pn || it.m), hay = (it.d || it.n || '') + ' ' + (it.mfr || '') + ' ' + (CATN[it.cat] || '') + ' ' + (it.s ? it.s.join(' ') : '') + ' ' + (it.id || '');
    if (pn === nq) return 100;
    if (pn.indexOf(nq) === 0) return 80;
    if (pn.indexOf(nq) > -1) return 60;
    var words = q.toLowerCase().split(/\s+/).filter(Boolean), h = hay.toLowerCase(), all = true;
    words.forEach(function (w) { if (h.indexOf(w) < 0 && norm(hay).indexOf(norm(w)) < 0) all = false; });
    return all ? 30 : 0;
  }
  function stockList() {
    var q = st.q.trim(), nq = norm(q), out = [];
    DATA.stock.forEach(function (it) {
      var sc = score(it, q, nq); if (!sc) return;
      for (var k in st.f) { var sel = Object.keys(st.f[k]); if (sel.length && sel.indexOf(it[k]) < 0) return; }
      out.push([sc, it]);
    });
    out.sort(function (a, b) {
      if (st.sort === 'pn') return a[1].pn.localeCompare(b[1].pn);
      if (st.sort === 'qty') return b[1].qty - a[1].qty;
      return b[0] - a[0] || b[1].qty - a[1].qty;
    });
    return out.map(function (x) { return x[1]; });
  }
  function spList() {
    var q = st.q.trim(), nq = norm(q), out = [];
    (DATA.spares || []).forEach(function (it) {
      var o = { pn: it.pn, d: it.d, mfr: it.b, cat: it.c };
      var sc = score(o, q, nq); if (!sc) return;
      var sb = Object.keys(st.sf.b), sc2 = Object.keys(st.sf.c);
      if (sb.length && sb.indexOf(it.b) < 0) return; if (sc2.length && sc2.indexOf(it.c) < 0) return;
      out.push([sc, it]);
    });
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out.map(function (x) { return x[1]; });
  }
  function spKey(it) { return 'R:' + it.b + ':' + it.pn; }
  function spCard(it) {
    var k = spKey(it);
    return '<article class="prod" data-k="' + esc(k) + '"><div class="hd"><span class="ic">' + ico(it.c) + '</span><div><span class="pn">' + esc(it.pn) + '</span><div class="mf">' + esc(it.b) + ' · ' + esc(CATN[it.c] || '') + '</div></div></div>' +
      '<p class="d">' + esc(it.d) + '</p><div class="ft"><span class="av req"><i></i>' + T('srcAvail') + '</span>' + stepper(k) +
      '<button class="add' + (inCart(k) ? ' done' : '') + '" type="button" data-sp="' + esc(k) + '" aria-label="' + T('add') + ' ' + esc(it.pn) + '">' + (inCart(k) ? '✓' : '+') + '</button></div></article>';
  }
  function renderSpares() {
    var list = spList(), box = $('#spGrid');
    $('#spCount').textContent = T('results', { n: list.length });
    box.innerHTML = list.length ? list.slice(0, st.slimit).map(spCard).join('') :
      '<div class="empty" style="grid-column:1/-1">' + ico('src') + '<p><b>' + T('none') + '</b></p><p>' + T('noneHint') + '</p>' + (st.q ? '<button class="btn btn-g" type="button" data-req="' + esc(st.q) + '">' + T('reqThis', { q: esc(st.q) }) + '</button>' : '') + '</div>';
    $('#spMore').hidden = list.length <= st.slimit;
    var q = st.q.trim(), nq = norm(q), base = (DATA.spares || []).filter(function (it) { return score({ pn: it.pn, d: it.d, mfr: it.b, cat: it.c }, q, nq); });
    [['b', DATA.sourcing], ['c', ['dcs', 'sis', 'tur', 'vib', 'drv', 'plc', 'rio', 'hmi', 'net', 'lv', 'acc', 'oth']]].forEach(function (x) {
      var k = x[0], cn = {}; base.forEach(function (it) { cn[it[k]] = (cn[it[k]] || 0) + 1; });
      $('#sf-' + k).innerHTML = x[1].filter(function (v) { return cn[v]; }).map(function (v) {
        return '<label><input type="checkbox" data-sf="' + k + '" value="' + esc(v) + '"' + (st.sf[k][v] ? ' checked' : '') + '><span>' + esc(k === 'c' ? CATN[v] : v) + '</span><em>' + cn[v] + '</em></label>';
      }).join('');
    });
  }
  function supList() {
    var q = st.q.trim(), nq = norm(q);
    return DATA.supmea.filter(function (it) { return (st.fam === 'all' || it.fam === st.fam) && score(it, q, nq); });
  }

  /* ---------- render ---------- */
  function tag(cls, txt) { return '<span class="tg ' + cls + '">' + esc(txt) + '</span>'; }
  function stepper(id) { return '<span class="stepper"><button type="button" data-step="-1" aria-label="−">−</button><input type="number" min="1" value="1" inputmode="numeric" aria-label="' + T('qty') + '" data-qty="' + esc(id) + '"><button type="button" data-step="1" aria-label="+">+</button></span>'; }
  function inCart(k) { return cart.some(function (l) { return l.k === k; }); }
  function stockCard(it) {
    var k = 'S:' + it.id;
    return '<article class="prod" data-k="' + esc(k) + '">' +
      '<div class="hd"><span class="ic">' + ico(it.cat) + '</span><div><button class="pn" type="button" data-open="' + esc(it.id) + '">' + esc(it.pn) + '</button><div class="mf">' + esc(it.mfr) + ' · ' + esc(CATN[it.cat]) + '</div></div></div>' +
      '<p class="d">' + esc(it.d) + '</p>' +
      '<div class="tags">' + tag(it.cond, T(it.cond)) + tag(it.life, T(it.life)) + (it.coo ? tag('', it.coo) : '') + '</div>' +
      '<div class="ft"><span class="av"><i></i>' + T('avail', { n: it.qty }) + '</span>' + stepper(k) +
      '<button class="add' + (inCart(k) ? ' done' : '') + '" type="button" data-add="' + esc(k) + '" aria-label="' + T('add') + ' ' + esc(it.pn) + '">' + (inCart(k) ? '✓' : '+') + '</button></div></article>';
  }
  function supCard(it) {
    return '<article class="prod" data-k="P:' + esc(it.m) + '">' + (it.eval ? '<span class="eval">' + T('eval') + '</span>' : '') +
      '<div class="hd"><span class="ic">' + ico(it.fam) + '</span><div><button class="pn" type="button" data-cfg="' + esc(it.m) + '">' + esc(it.m) + '</button><div class="mf">Supmea · ' + esc(T(it.fam)) + '</div></div></div>' +
      '<p class="d"><b>' + esc(it.n) + '</b></p><ul class="spec">' + it.s.map(function (x) { return '<li class="ltr">' + esc(x) + '</li>'; }).join('') + '</ul>' +
      (it.ds ? '<a class="tg" href="' + esc(it.ds) + '" target="_blank" rel="noopener" style="align-self:flex-start">↗ ' + T('ds') + '</a>' : '') + '<div class="ft"><span class="av imp"><i></i>' + T('import', { w: it.lead }) + '</span><button class="add" type="button" data-cfg="' + esc(it.m) + '">' + T('configure') + '</button></div></article>';
  }
  function renderStock() {
    var list = stockList(), box = $('#stockGrid');
    box.className = 'pgrid2' + (st.view === 'list' ? ' list' : '');
    $('#stockCount').textContent = T('results', { n: list.length });
    if (!list.length) {
      box.innerHTML = '<div class="empty" style="grid-column:1/-1">' + ico('src') + '<p><b>' + T('none') + '</b></p><p>' + T('noneHint') + '</p>' +
        (st.q ? '<button class="btn btn-g" type="button" data-req="' + esc(st.q) + '">' + T('reqThis', { q: esc(st.q) }) + '</button>' : '') +
        '<button class="clear-f" type="button" data-clear>' + T('clear') + '</button></div>';
      $('#moreBtn').hidden = true; return;
    }
    box.innerHTML = list.slice(0, st.limit).map(stockCard).join('');
    $('#moreBtn').hidden = list.length <= st.limit;
    renderFacets();
  }
  function renderFacets() {
    var q = st.q.trim(), nq = norm(q), base = DATA.stock.filter(function (it) { return score(it, q, nq); });
    var defs = { cat: Object.keys(CATN), cond: ['new', 'used', 'ref'], life: ['active', 'phase', 'disc', 'tbc'] };
    Object.keys(defs).forEach(function (k) {
      var counts = {}; base.forEach(function (it) { counts[it[k]] = (counts[it[k]] || 0) + 1; });
      $('#f-' + k).innerHTML = defs[k].filter(function (v) { return counts[v]; }).map(function (v) {
        return '<label><input type="checkbox" data-f="' + k + '" value="' + v + '"' + (st.f[k][v] ? ' checked' : '') + '><span>' + esc(k === 'cat' ? CATN[v] : T(v)) + '</span><em>' + counts[v] + '</em></label>';
      }).join('');
    });
  }
  function renderSup() {
    var list = supList();
    $('#supGrid').innerHTML = list.length ? list.map(supCard).join('') :
      '<div class="empty" style="grid-column:1/-1">' + ico('src') + '<p><b>' + T('none') + '</b></p>' + (st.q ? '<button class="btn btn-g" type="button" data-req="' + esc(st.q) + '">' + T('reqThis', { q: esc(st.q) }) + '</button>' : '') + '</div>';
    $$('#famTabs .ftab').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fam === st.fam ? 'true' : 'false'); });
  }
  function counts() {
    var q = st.q.trim(), nq = norm(q);
    $('#c-stock').textContent = q ? stockList().length : DATA.stock.length;
    $('#c-source').textContent = q ? spList().length : (DATA.spares || []).length;
    $('#c-supmea').textContent = q ? DATA.supmea.filter(function (it) { return score(it, q, nq); }).length : DATA.supmea.length;
  }
  function show(src) {
    st.src = src;
    $$('.src').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.src === src ? 'true' : 'false'); });
    $$('.pane').forEach(function (p) { p.hidden = p.id !== 'pane-' + src; });
    $('.view-tg').style.visibility = src === 'stock' ? 'visible' : 'hidden';
    if (src === 'stock') renderStock(); else if (src === 'supmea') renderSup(); else renderSpares();
  }
  function refresh() { st.limit = 24; st.slimit = 24; counts(); if (st.src === 'stock') renderStock(); else if (st.src === 'supmea') renderSup(); else renderSpares(); }

  /* ---------- cart ---------- */
  function save() { store.set('ies_rfq', cart); renderCart(); }
  function addLine(line, qty) {
    var ex = cart.filter(function (l) { return l.k === line.k; })[0];
    if (ex) ex.qty += qty || 1; else { line.qty = qty || 1; cart.push(line); }
    save(); var f = $('.fab'); f.classList.remove('bump'); void f.offsetWidth; f.classList.add('bump');
    toast(T('toast', { pn: line.pn }));
  }
  function renderCart() {
    var n = cart.reduce(function (a, l) { return a + 1; }, 0);
    $('.fab .n').textContent = n;
    var box = $('#lines');
    $('#cartEmpty').hidden = !!n; $('#cartForm').hidden = !n; $('#drFt').hidden = !n;
    box.innerHTML = cart.map(function (l, i) {
      var srcTxt = l.src === 'stock' ? T('stkTag') : l.src === 'supmea' ? T('supTag') : T('sourcing');
      return '<div class="line"><div><span class="src3">' + esc(srcTxt) + '</span> <span class="pn">' + esc(l.pn) + '</span></div>' +
        '<p class="d">' + esc(l.d || '') + '</p>' +
        '<div class="ctl"><span class="stepper"><button type="button" data-lstep="-1" data-i="' + i + '">−</button><input type="number" min="1" value="' + l.qty + '" data-lqty="' + i + '" aria-label="' + T('qty') + '"><button type="button" data-lstep="1" data-i="' + i + '">+</button></span>' +
        '<button class="rm" type="button" data-rm="' + i + '" aria-label="' + T('remove') + '">×</button></div>' +
        '<input class="note" type="text" data-lnote="' + i + '" value="' + esc(l.note || '') + '" placeholder="' + T('lineNote') + '"></div>';
    }).join('');
    $$('[data-add],[data-sp]').forEach(function (b) { var on = inCart(b.dataset.add || b.dataset.sp); b.classList.toggle('done', on); b.textContent = on ? '✓' : '+'; });
  }
  function rid() {
    var id = store.get('ies_rfq_id', null);
    if (!id) { var d = new Date(); id = 'RFQ-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); store.set('ies_rfq_id', id); }
    return id;
  }
  function openDrawer(on) { $('.drawer').classList.toggle('on', on); $('.scrim').classList.toggle('on', on || $('.modal').classList.contains('on')); if (on) { $('#rid').textContent = rid(); renderCart(); setTimeout(function () { $('.drawer .x').focus(); }, 50); } }
  function formData() { var f = $('#cartForm'), o = {}; $$('input,textarea', f).forEach(function (i) { o[i.name] = i.value.trim(); }); return o; }
  function rfqText(c) {
    var L = ['IES STORE – REQUEST FOR QUOTATION ' + rid(), '',
      'Company: ' + c.company, 'Contact: ' + c.name, 'Phone: ' + c.phone, 'Email: ' + (c.email || '-'), 'Delivery city: ' + (c.city || '-'),
      'Project / PO ref: ' + (c.project || '-'), 'Required by: ' + (c.date || '-'), '', 'ITEMS:'];
    cart.forEach(function (l, i) { L.push((i + 1) + '. [' + l.src.toUpperCase() + '] ' + l.pn + ' × ' + l.qty + (l.d ? ' — ' + l.d : '') + (l.note ? ' | Note: ' + l.note : '')); });
    if (c.msg) L.push('', 'Message: ' + c.msg);
    L.push('', 'Sent from ' + location.href.split('#')[0]);
    return L.join('\n');
  }
  function csv() {
    var c = formData(), rows = [['RFQ', rid()], ['Company', c.company], ['Contact', c.name], ['Phone', c.phone], ['Email', c.email], [], ['#', 'Source', 'Part number / model', 'Description', 'Qty', 'Note']];
    cart.forEach(function (l, i) { rows.push([i + 1, l.src, l.pn, l.d || '', l.qty, l.note || '']); });
    var s = '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv' })); a.download = rid() + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  }
  function valid() {
    var c = formData();
    if (!c.company || !c.name || !c.phone) { $('#formMsg').textContent = T('need'); $('#formMsg').hidden = false; return null; }
    $('#formMsg').hidden = true; return c;
  }
  function mail(c) { location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(rid() + ' — ' + c.company) + '&body=' + encodeURIComponent(rfqText(c)); }
  function wa(c) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(rfqText(c)), '_blank', 'noopener'); }
  function done(msg) {
    $('#done').innerHTML = esc(msg); $('#done').hidden = false;
    store.set('ies_rfq_last', { id: rid(), lines: cart }); cart = []; store.set('ies_rfq_id', null); save();
    $('#cartEmpty').hidden = true;
  }
  function send() {
    var c = valid(); if (!c) return;
    if (!LIVE) { mail(c); done(T('okTest', { id: rid() })); return; }
    var b = $('#sendBtn'); b.disabled = true; b.textContent = T('sending');
    fetch(BASE + 'api/rfq.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rid(), lang: AR ? 'ar' : 'en', customer: c, lines: cart, page: location.href, hp: $('#hp').value }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw 0; done(T('okLive', { id: j.id || rid() })); })
      .catch(function () { $('#formMsg').textContent = T('fail'); $('#formMsg').hidden = false; })
      .then(function () { b.disabled = false; b.textContent = T('send'); });
  }

  /* ---------- modal ---------- */
  function modal(html) { $('.modal .box').innerHTML = html; $('.modal').classList.add('on'); $('.scrim').classList.add('on'); setTimeout(function () { var x = $('.modal .x'); if (x) x.focus(); }, 30); }
  function closeModal() { $('.modal').classList.remove('on'); if (!$('.drawer').classList.contains('on')) $('.scrim').classList.remove('on'); }
  function openItem(id) {
    var it = DATA.stock.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    var k = 'S:' + it.id;
    modal('<div class="m-h"><span class="ic" style="color:var(--green)">' + ico(it.cat) + '</span><div style="flex:1"><div class="pn">' + esc(it.pn) + '</div><p>' + esc(it.d) + '</p></div><button class="x" type="button" data-close aria-label="Close">×</button></div>' +
      '<div class="m-b"><div class="tags">' + tag(it.cond, T(it.cond)) + tag(it.life, T(it.life)) + '</div><div class="kv">' +
      kv(T('mfr'), it.mfr) + kv(T('cat'), CATN[it.cat]) + kv(T('coo'), it.coo || '—') + kv(T('hs'), it.hs || '—') + kv(T('code'), it.id) + kv(T('price'), T('onQuote')) +
      (it.succ ? kv(T('succ'), it.succ) : '') + '</div><span class="av"><i></i>' + T('avail', { n: it.qty }) + ' · ' + esc(it.uom) + '</span></div>' +
      '<div class="m-f"><button class="btn btn-l" type="button" data-share="' + esc(it.pn) + '">' + T('share') + '</button>' + stepper(k) + '<button class="btn btn-g" type="button" data-add="' + esc(k) + '" data-close>' + T('add') + '</button></div>');
  }
  function kv(k, v) { return '<div><small>' + esc(k) + '</small><b class="ltr">' + esc(v) + '</b></div>'; }
  function sel(name, label, opts) {
    if (opts === 'DN') return '<label>' + T('range') + '<input name="' + name + '" placeholder="' + T('dn') + '"></label>';
    if (opts === 'RANGE') return '<label>' + T('range') + '<input name="' + name + '" placeholder="' + T('prange') + '"></label>';
    return '<label>' + label + '<select name="' + name + '"><option value="">—</option>' + opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label>';
  }
  function openCfg(m) {
    var it = DATA.supmea.filter(function (x) { return x.m === m; })[0]; if (!it) return;
    var o = it.opt;
    modal('<div class="m-h"><span class="ic" style="color:var(--green)">' + ico(it.fam) + '</span><div style="flex:1"><div class="pn">' + esc(it.m) + '</div><p>Supmea · ' + esc(it.n) + '</p></div><button class="x" type="button" data-close aria-label="Close">×</button></div>' +
      '<div class="m-b"><ul class="spec" style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:14px;color:var(--mut)">' + it.s.map(function (x) { return '<li class="ltr">▸ ' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<form class="cfg" id="cfgForm">' + sel('range', T('range'), o.size || o.range) + sel('out', T('out'), o.out) + sel('conn', T('conn'), o.conn) +
      '<label>' + T('qty') + '<input name="qty" type="number" min="1" value="1"></label><label class="w">' + T('notes') + '<textarea name="note" rows="2"></textarea></label></form>' +
      '<div class="code" id="cfgCode">' + esc(it.m) + '</div></div>' +
      '<div class="m-f">' + (it.ds ? '<a class="btn btn-l" href="' + esc(it.ds) + '" target="_blank" rel="noopener">↗ ' + T('ds') + '</a>' : '') + '<span class="note2">' + T('cfgNote') + ' ' + T('lead') + ': ' + T('weeks', { w: it.lead }) + '.</span><button class="btn btn-g" type="button" data-cfgadd="' + esc(it.m) + '">' + T('add') + '</button></div>');
    var f = $('#cfgForm');
    f.addEventListener('input', function () { $('#cfgCode').textContent = cfgSummary(it, f); });
  }
  function cfgSummary(it, f) { var v = new FormData(f), p = [it.m]; ['range', 'out', 'conn'].forEach(function (k) { if (v.get(k)) p.push(v.get(k)); }); return p.join(' | '); }

  /* ---------- BOM ---------- */
  function parseBom() {
    var txt = $('#bom').value, a = 0, b = 0, c = 0, log = [];
    txt.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim(); if (!line) return;
      var m = line.match(/^(.*?)[\s,;\t]+(?:x|qty[:\s]*|×)?\s*(\d{1,5})\s*(?:pcs|pc|ea|x)?$/i), pn = line, q = 1;
      if (m && m[1].trim().length >= 3) { pn = m[1].trim().replace(/[,;]$/, ''); q = parseInt(m[2], 10); }
      pn = pn.replace(/^\d+[.)]\s+/, '');
      var hit = DATA.stock.filter(function (it) { return norm(it.pn) === norm(pn); })[0];
      a++;
      if (hit) { b++; addLine({ k: 'S:' + hit.id, pn: hit.pn, d: hit.d, src: 'stock' }, q); log.push('<div class="ok">✓ ' + esc(hit.pn) + ' × ' + q + ' — ' + T('found') + '</div>'); }
      else {
        c++; var sp = (DATA.spares || []).filter(function (x) { return norm(x.pn) === norm(pn) || norm(x.pn.split(' ')[0]) === norm(pn); })[0];
        if (sp) addLine({ k: spKey(sp), pn: sp.pn, d: sp.b + ' — ' + sp.d, src: 'sourcing' }, q);
        else addLine({ k: 'X:' + norm(pn), pn: pn, d: $('#bomBrand').value || '', src: 'sourcing' }, q); log.push('<div class="src2">→ ' + esc(pn) + ' × ' + q + ' — ' + T('toSource') + '</div>'); }
    });
    if (a) { $('#bomLog').innerHTML = '<p><b>' + T('lines', { a: a, b: b, c: c }) + '</b></p>' + log.join(''); $('#bom').value = ''; }
  }

  var tt; function toast(m) { var t = $('.toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2000); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,a,[data-src]'); if (!t) return;
    var d = t.dataset;
    if (d.src && t.classList.contains('src')) { show(d.src); history.replaceState(null, '', '#' + d.src); }
    else if (d.jump) { openDrawer(false); show(d.jump); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (d.chip) { $('#q').value = d.chip; st.q = d.chip; if (d.to) show(d.to); refresh(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (d.step) { var inp = t.parentNode.querySelector('input'); inp.value = Math.max(1, (parseInt(inp.value, 10) || 1) + parseInt(d.step, 10)); }
    else if (d.add) {
      var it = DATA.stock.filter(function (x) { return 'S:' + x.id === d.add; })[0];
      var qi = $('[data-qty="' + d.add + '"]', t.closest('.prod,.box')); var q = qi ? parseInt(qi.value, 10) || 1 : 1;
      if (it) addLine({ k: d.add, pn: it.pn, d: it.d, src: 'stock' }, q);
      if ('close' in d) closeModal();
    }
    else if (d.sp) {
      var sp2 = (DATA.spares || []).filter(function (x) { return spKey(x) === d.sp; })[0];
      var qi2 = $('[data-qty="' + d.sp + '"]', t.closest('.prod')); 
      if (sp2) addLine({ k: d.sp, pn: sp2.pn, d: sp2.b + ' — ' + sp2.d, src: 'sourcing' }, qi2 ? parseInt(qi2.value, 10) || 1 : 1);
    }
    else if (t.id === 'spMore') { st.slimit += 24; renderSpares(); }
    else if (d.open) openItem(d.open);
    else if (d.cfg) openCfg(d.cfg);
    else if (d.cfgadd) {
      var sp = DATA.supmea.filter(function (x) { return x.m === d.cfgadd; })[0], f = $('#cfgForm'), v = new FormData(f);
      var spec = cfgSummary(sp, f); addLine({ k: 'P:' + spec, pn: sp.m, d: sp.n + (spec !== sp.m ? ' — ' + spec.split(' | ').slice(1).join(', ') : ''), note: v.get('note') || '', src: 'supmea' }, parseInt(v.get('qty'), 10) || 1);
      closeModal();
    }
    else if ('close' in d) closeModal();
    else if (d.req) { addLine({ k: 'X:' + norm(d.req), pn: d.req, d: '', src: 'sourcing' }, 1); openDrawer(true); }
    else if ('clear' in d) { st.f = { cat: {}, cond: {}, life: {} }; st.q = ''; $('#q').value = ''; refresh(); }
    else if (d.fam) { st.fam = d.fam; renderSup(); }
    else if (d.view) { st.view = d.view; store.set('ies_store_view', st.view); $$('.view-tg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === st.view ? 'true' : 'false'); }); renderStock(); }
    else if (t.id === 'moreBtn') { st.limit += 24; renderStock(); }
    else if (t.classList.contains('fab') || d.cart != null) openDrawer(true);
    else if (t.classList.contains('x') && t.closest('.drawer')) openDrawer(false);
    else if (d.rm != null) { cart.splice(+d.rm, 1); save(); }
    else if (d.lstep) { var l = cart[+d.i]; l.qty = Math.max(1, l.qty + parseInt(d.lstep, 10)); save(); }
    else if (t.id === 'sendBtn') send();
    else if (t.id === 'mailBtn') { var c1 = valid(); if (c1) mail(c1); }
    else if (t.id === 'waBtn') { var c2 = valid(); if (c2) wa(c2); }
    else if (t.id === 'csvBtn') csv();
    else if (t.id === 'bomBtn') parseBom();
    else if (t.id === 'fOpen') $('.facets').classList.add('on');
    else if (t.id === 'fClose') $('.facets').classList.remove('on');
    else if (d.share) { var u = location.href.split('#')[0].split('?')[0] + '?q=' + encodeURIComponent(d.share); try { navigator.clipboard.writeText(u).then(function () { toast(T('copied')); }); } catch (x) {} }
  });
  $('.scrim').addEventListener('click', function () { closeModal(); openDrawer(false); $('.facets').classList.remove('on'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); openDrawer(false); $('.facets').classList.remove('on'); }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); $('#q').focus(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, d = t.dataset;
    if (d.sf) { if (t.checked) st.sf[d.sf][t.value] = 1; else delete st.sf[d.sf][t.value]; st.slimit = 24; renderSpares(); }
    else if (d.f) { if (t.checked) st.f[d.f][t.value] = 1; else delete st.f[d.f][t.value]; st.limit = 24; renderStock(); counts(); }
    else if (d.lqty != null) { cart[+d.lqty].qty = Math.max(1, parseInt(t.value, 10) || 1); save(); }
    else if (d.lnote != null) { cart[+d.lnote].note = t.value; store.set('ies_rfq', cart); }
    else if (t.id === 'sort') { st.sort = t.value; renderStock(); }
  });
  var qt; $('#q').addEventListener('input', function (e) {
    clearTimeout(qt); qt = setTimeout(function () {
      st.q = e.target.value; refresh();
      if (st.q) {
        var n = { stock: stockList().length, supmea: supList().length, source: spList().length };
        if (!n[st.src]) { var best = ['stock', 'supmea', 'source'].filter(function (k) { return n[k]; })[0]; if (best) show(best); }
      }
    }, 120);
  });
  $('#q').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); });

  /* ---------- boot ---------- */
  fetch(BASE + 'data/catalog.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
    DATA = j;
    $('#k-stock').textContent = j.stock.length; $('#k-sup').textContent = j.supmea.length; $('#k-src').textContent = (j.spares || []).length;
    $('#brandList').innerHTML = j.sourcing.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('');
    $('#bomBrand').innerHTML = '<option value="">—</option>' + j.sourcing.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    $('#upd').textContent = j.generated;
    var p = new URLSearchParams(location.search); if (p.get('q')) { st.q = p.get('q'); $('#q').value = st.q; }
    var h = location.hash.slice(1); counts(); show(['stock', 'supmea', 'source'].indexOf(h) > -1 ? h : 'stock');
    $$('.view-tg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === st.view ? 'true' : 'false'); });
    renderCart();
  });
})();
