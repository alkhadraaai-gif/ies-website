/* IES Store — Phase 1 (quote-only), R7.1: Industrial / Building divisions. Vanilla JS. */
(function () {
  'use strict';
  var AR = document.documentElement.lang === 'ar';
  var BASE = document.body.getAttribute('data-store-base') || '';
  var LIVE = /(^|\.)al-khadraa\.com$/.test(location.hostname);
  var EMAIL = 'info@ies-iraq.com', WA = '9647903435616';

  var S = {
    en: {
      'ind:ctl': 'Control Systems', 'ind:ins': 'Instruments', 'ind:spr': 'Legacy Spares', 'bld:bms': 'BMS', 'bld:knx': 'KNX', 'bld:fire': 'Fire Alarm', 'bld:ins': 'Instruments',
      'n:ind:ctl': 'Siemens PLC, remote I/O, HMI, networking and LV control items in our Baghdad warehouse.',
      'n:ind:ins': 'Process instruments: IES stock in Baghdad plus Supmea instruments imported to order. Choose the options you know; our engineers confirm the final order code and datasheet in the quotation.',
      'n:ind:spr': 'Representative legacy DCS / PLC / SIS part numbers from our sourcing partners — thousands more are available. Paste your list above to check it in one step.',
      'n:bld:bms': 'Desigo automation stations, TX-I/O modules and BMS accessories in our Baghdad warehouse.',
      'n:bld:knx': 'Siemens KNX devices in our Baghdad warehouse.', 'n:bld:fire': 'Fire detectors, bases, manual call points, sounders and modules in our Baghdad warehouse.',
      'n:bld:ins': 'Room, duct and flow devices for HVAC and building services — stock items plus Supmea instruments for chilled-water, energy and tank monitoring.',
      avail: '{n} in stock', import: '{w} weeks delivery', srcAvail: 'On request · 1–3 weeks',
      add: 'Add to RFQ', results: '{n} items', none: 'No items match your search.', noneHint: 'Send the part number anyway — we source legacy and hard-to-find parts.', reqThis: 'Request “{q}”',
      clear: 'Clear filters', fAv: 'Availability', fType: 'Product type', fBrand: 'Brand', fCond: 'Condition',
      stock: 'In stock (Baghdad)', repPic: 'Representative picture', supmea: '4–6 weeks delivery', spare: 'Sourced on request',
      new: 'New', used: 'Used / old stock', ref: 'Refurbished', active: 'Active', phase: 'Phase-out', disc: 'Discontinued', tbc: 'Lifecycle TBC',
      coo: 'Country of origin', hs: 'HS code', code: 'IES item code', succ: 'Successor', qty: 'Quantity', mfr: 'Manufacturer', cat: 'Category', price: 'Price', onQuote: 'In quotation',
      configure: 'Configure & add', range: 'Range / size', out: 'Output', conn: 'Process connection', notes: 'Notes (medium, temperature, number of tags…)',
      dn: 'Nominal size (e.g. DN80)', prange: 'Pressure range (e.g. 0–10 bar)', cfgNote: 'Final order code and datasheet are confirmed by IES engineers in the quotation.',
      eval: 'Evaluated by IES', lead: 'Lead time', weeks: '{w} weeks', ds: 'Datasheet (PDF)',
      indep: 'Supplied from independent stock, not as manufacturer-authorised supply. Condition, test report and IES warranty are stated in the quotation.',
      lineNote: 'Note for this line (optional)', send: 'Send RFQ', sending: 'Sending…', need: 'Please fill company, contact name and phone.',
      okLive: 'RFQ {id} received. We will reply within one working day.', okTest: 'RFQ {id} prepared. Your email app opens with the full RFQ — press Send. You can also send it on WhatsApp.',
      fail: 'Could not reach the server — please send by email or WhatsApp below.', found: 'in IES stock', toSource: 'added for sourcing', listed: 'listed spare',
      lines: '{a} lines added: {b} from stock, {c} for sourcing.', toast: '{pn} added to RFQ', remove: 'Remove', share: 'Copy link', copied: 'Link copied',
      stkTag: 'Stock', supTag: 'Supmea', sourcing: 'Sourcing', imgNote: 'Picture for identification; the supplied item may differ in revision or appearance.',
      t: { plc: 'PLC & controllers', rio: 'Remote I/O', hmi: 'HMI panels', psu: 'Power supplies', net: 'Network & comms', inst: 'Process instruments', fire: 'Fire alarm', bms: 'Building automation', knx: 'KNX', lv: 'LV controls', acc: 'Accessories', oth: 'Other',
        dcs: 'DCS modules', sis: 'Safety systems (SIS / F&G)', tur: 'Turbine & generator control', vib: 'Vibration monitoring', drv: 'Drives & power electronics',
        flow: 'Flow', level: 'Level', press: 'Pressure', temp: 'Temperature', anal: 'Water analysis', rec: 'Recorders' }
    },
    ar: {
      'ind:ctl': 'أنظمة التحكم', 'ind:ins': 'أجهزة القياس', 'ind:spr': 'قطع غيار قديمة', 'bld:bms': 'BMS', 'bld:knx': 'KNX', 'bld:fire': 'إنذار الحريق', 'bld:ins': 'أجهزة القياس',
      'n:ind:ctl': 'مواد سيمنس من PLC ووحدات I/O وشاشات HMI والشبكات ومعدات التحكم في مخزننا في بغداد.',
      'n:ind:ins': 'أجهزة القياس: مخزون IES في بغداد إضافة إلى أجهزة Supmea المستوردة حسب الطلب. اختر ما تعرفه من المواصفات ويؤكد مهندسونا رمز الطلب النهائي في عرض السعر.',
      'n:ind:spr': 'أرقام قطع نموذجية لأنظمة DCS / PLC / SIS القديمة من شركائنا، وتتوفر آلاف القطع الأخرى. الصق قائمتك أعلاه للتحقق منها دفعة واحدة.',
      'n:bld:bms': 'محطات Desigo ووحدات TX-I/O وملحقات أنظمة إدارة المباني في مخزننا في بغداد.',
      'n:bld:knx': 'أجهزة KNX من سيمنس في مخزننا في بغداد.', 'n:bld:fire': 'كواشف وقواعد ونقاط إنذار يدوية وصفارات ووحدات إنذار الحريق في مخزننا في بغداد.',
      'n:bld:ins': 'حساسات الغرف ومجاري الهواء ومفاتيح الجريان لأنظمة التكييف والخدمات، مع أجهزة Supmea لقياس المياه المبردة والطاقة والخزانات.',
      avail: 'متوفر {n}', import: 'التوريد خلال {w} أسابيع', srcAvail: 'حسب الطلب · 1–3 أسابيع',
      add: 'أضف إلى الطلب', results: '{n} مادة', none: 'لا توجد مواد مطابقة لبحثك.', noneHint: 'أرسل رقم القطعة على أي حال — نوفّر القطع القديمة والنادرة.', reqThis: 'اطلب «{q}»',
      clear: 'مسح الفلاتر', fAv: 'التوفر', fType: 'نوع المنتج', fBrand: 'العلامة التجارية', fCond: 'الحالة',
      stock: 'متوفر في بغداد', repPic: 'صورة تمثيلية', supmea: 'التوريد خلال 4–6 أسابيع', spare: 'يُوفَّر حسب الطلب',
      new: 'جديد', used: 'مستعمل / مخزون قديم', ref: 'مجدد', active: 'فعال', phase: 'قيد الإيقاف', disc: 'متوقف إنتاجه', tbc: 'دورة الحياة قيد التأكيد',
      coo: 'بلد المنشأ', hs: 'رمز HS', code: 'رمز المادة في IES', succ: 'البديل', qty: 'الكمية', mfr: 'الشركة المصنعة', cat: 'الفئة', price: 'السعر', onQuote: 'ضمن عرض السعر',
      configure: 'اختر المواصفات وأضف', range: 'المدى / القياس', out: 'الإشارة الخارجة', conn: 'التوصيل', notes: 'ملاحظات (المادة المقاسة، الحرارة، عدد الأجهزة…)',
      dn: 'القطر الاسمي (مثال DN80)', prange: 'مدى الضغط (مثال 0–10 bar)', cfgNote: 'يؤكد مهندسو IES رمز الطلب النهائي وورقة المواصفات في عرض السعر.',
      eval: 'مُقيَّم من IES', lead: 'مدة التوريد', weeks: '{w} أسابيع', ds: 'ورقة المواصفات (PDF)',
      indep: 'تُجهَّز من مخزون مستقل وليس كتوريد معتمد من الشركة المصنعة. تُذكر الحالة وتقرير الفحص وضمان IES في عرض السعر.',
      lineNote: 'ملاحظة لهذا البند (اختياري)', send: 'أرسل طلب التسعير', sending: 'جارٍ الإرسال…', need: 'يرجى إدخال الشركة واسم الشخص والهاتف.',
      okLive: 'تم استلام الطلب {id}. سنرد خلال يوم عمل واحد.', okTest: 'تم تجهيز الطلب {id}. سيفتح برنامج البريد مع تفاصيل الطلب — اضغط إرسال. ويمكنك إرساله عبر واتساب أيضاً.',
      fail: 'تعذر الاتصال بالخادم — يرجى الإرسال بالبريد أو واتساب أدناه.', found: 'متوفر في مخزن IES', toSource: 'أضيف للتوفير', listed: 'قطعة مدرجة',
      lines: 'أضيف {a} بنود: {b} من المخزن و{c} للتوفير.', toast: 'أضيف {pn} إلى الطلب', remove: 'حذف', share: 'نسخ الرابط', copied: 'تم نسخ الرابط',
      stkTag: 'مخزن', supTag: 'Supmea', sourcing: 'توفير', imgNote: 'الصورة لتعريف المنتج، وقد تختلف المادة المجهزة في الإصدار أو الشكل.',
      t: { plc: 'PLC ومتحكمات', rio: 'وحدات I/O عن بعد', hmi: 'شاشات HMI', psu: 'مجهزات قدرة', net: 'اتصالات وشبكات', inst: 'أجهزة القياس', fire: 'إنذار الحريق', bms: 'أتمتة المباني', knx: 'KNX', lv: 'معدات الجهد المنخفض', acc: 'ملحقات', oth: 'أخرى',
        dcs: 'وحدات DCS', sis: 'أنظمة السلامة (SIS / F&G)', tur: 'تحكم التوربينات والمولدات', vib: 'مراقبة الاهتزاز', drv: 'المحركات وإلكترونيات القدرة',
        flow: 'الجريان', level: 'المنسوب', press: 'الضغط', temp: 'الحرارة', anal: 'تحليل المياه', rec: 'المسجلات' }
    }
  }[AR ? 'ar' : 'en'];
  var SECS = { ind: ['ind:ctl', 'ind:ins', 'ind:spr'], bld: ['bld:bms', 'bld:knx', 'bld:fire', 'bld:ins'] };
  var ALLSECS = SECS.ind.concat(SECS.bld);
  var ICON = {
    plc:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h2M7 12h2M7 16h2M13 8h4M13 12h4M13 16h4"/>',
    rio:'<rect x="2" y="6" width="5" height="12" rx="1"/><rect x="9.5" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/>',
    hmi:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', psu:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    net:'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v5M12 12.5 6.5 17M12 12.5l5.5 4.5"/>',
    inst:'<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M12 3v2"/>', fire:'<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 2 3 3 3 5 0-3 0-6 0-8z"/>',
    bms:'<path d="M3 21V9l9-6 9 6v12z"/><path d="M9 21v-6h6v6"/>', knx:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9v6M9 12l5-3M11 12l4 3"/>',
    lv:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M12 8v8"/>', acc:'<path d="M14 7l3-3 3 3-3 3M4 20l9-9"/><circle cx="6" cy="18" r="2"/>', oth:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    flow:'<path d="M3 9h12a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>', level:'<path d="M5 3v18h14V3"/><path d="M5 13c2-1.5 4-1.5 7 0s5 1.5 7 0"/>',
    press:'<circle cx="12" cy="12" r="9"/><path d="M12 12l5-5M7 16h10"/>', temp:'<path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z"/>',
    anal:'<path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-10V3"/>', rec:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M6 14l3-4 3 3 3-5 3 4"/>',
    dcs:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/>',
    sis:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
    tur:'<circle cx="12" cy="12" r="2"/><path d="M12 10C12 5 15 3 17 4M14 12c5 0 7 3 6 5M12 14c0 5-3 7-5 6M10 12c-5 0-7-3-6-5"/>',
    vib:'<path d="M2 12h3l2-6 3 12 3-9 2 5 2-2h5"/>', drv:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M8 7h8"/>',
    src:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.5-4.5"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[k] || ICON.oth) + '</svg>'; }
  function T(k, o) { var s = S[k] || k; if (o) for (var p in o) s = s.split('{' + p + '}').join(o[p]); return s; }
  function TT(k) { return S.t[k] || k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[\s\-_.\/]/g, ''); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var store = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  function nf() { return { src: {}, t: {}, mfr: {}, cond: {} }; }

  var ITEMS = [], BYK = {};
  var st = { div: 'ind', sec: 'ind:ctl', q: '', f: nf(), sort: 'rel', view: store.get('ies_store_view', 'grid'), limit: 24 };
  var cart = store.get('ies_rfq', []);

  /* ---------- search & filter ---------- */
  function score(it, q, nq) {
    if (!q) return 1;
    var pn = norm(it.pn), hay = it.d + ' ' + it.mfr + ' ' + TT(it.t) + ' ' + (it.s ? it.s.join(' ') : '') + ' ' + (it.id || '');
    if (pn === nq) return 100; if (pn.indexOf(nq) === 0) return 80; if (nq.length > 2 && pn.indexOf(nq) > -1) return 60;
    var h = hay.toLowerCase(), nh = norm(hay);
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return h.indexOf(w) > -1 || nh.indexOf(norm(w)) > -1; }) ? 30 : 0;
  }
  function base(sec) { var q = st.q.trim(), nq = norm(q); return ITEMS.filter(function (it) { return it.sec.indexOf(sec) > -1 && (it._s = score(it, q, nq)); }); }
  function list() {
    var out = base(st.sec).filter(function (it) {
      for (var k in st.f) { var sel = Object.keys(st.f[k]); if (sel.length && sel.indexOf(String(it[k])) < 0) return false; }
      return true;
    });
    var rank = { stock: 0, supmea: 1, spare: 2 };
    out.sort(function (a, b) {
      if (st.sort === 'pn') return a.pn.localeCompare(b.pn);
      if (st.sort === 'qty') return (b.qty || 0) - (a.qty || 0);
      return b._s - a._s || rank[a.src] - rank[b.src] || (b.img ? 1 : 0) - (a.img ? 1 : 0) || (b.qty || 0) - (a.qty || 0);
    });
    return out;
  }

  /* ---------- render ---------- */
  function tag(cls, txt) { return '<span class="tg ' + cls + '">' + esc(txt) + '</span>'; }
  function stepper(k) { return '<span class="stepper"><button type="button" data-step="-1" aria-label="−">−</button><input type="number" min="1" value="1" inputmode="numeric" aria-label="' + T('qty') + '" data-qty="' + esc(k) + '"><button type="button" data-step="1" aria-label="+">+</button></span>'; }
  function inCart(k) { return cart.some(function (l) { return l.k === k; }); }
  function pic(it, cls) {
    return '<button class="pic ' + (cls || '') + '" type="button" data-open="' + esc(it.k) + '" aria-label="' + esc(it.pn) + '">' +
      (it.img ? '<img src="' + BASE + esc(it.img) + '" alt="' + esc(it.mfr + ' ' + it.pn) + '" loading="lazy" decoding="async">' : '<span class="ph">' + ico(it.t) + '<em>' + esc(it.mfr) + '</em><small class="ltr">' + esc(it.pn) + '</small></span>') +
      (it.eval ? '<span class="eval">' + T('eval') + '</span>' : '') + (it.rep && it.img ? '<span class="repb">' + T('repPic') + '</span>' : '') + '</button>';
  }
  function avail(it) {
    if (it.src === 'stock') return '<span class="av"><i></i>' + T('avail', { n: it.qty }) + '</span>';
    if (it.src === 'supmea') return '<span class="av imp"><i></i>' + T('import', { w: it.lead }) + '</span>';
    return '<span class="av req"><i></i>' + T('srcAvail') + '</span>';
  }
  function card(it) {
    var tags = it.src === 'stock' ? tag(it.cond, T(it.cond)) + tag(it.life, T(it.life)) + (it.coo ? tag('', it.coo) : '') :
               it.src === 'supmea' ? '<ul class="spec">' + it.s.slice(0, 3).map(function (x) { return '<li class="ltr">' + esc(x) + '</li>'; }).join('') + '</ul>' : '';
    var act = it.src === 'supmea' ? '<button class="add wide" type="button" data-open="' + esc(it.k) + '">' + T('configure') + '</button>' :
      stepper(it.k) + '<button class="add' + (inCart(it.k) ? ' done' : '') + '" type="button" data-add="' + esc(it.k) + '" aria-label="' + T('add') + ' ' + esc(it.pn) + '">' + (inCart(it.k) ? '✓' : '+') + '</button>';
    return '<article class="prod">' + pic(it) + '<div class="pb"><div class="mf">' + esc(it.mfr) + ' · ' + esc(TT(it.t)) + '</div>' +
      '<button class="pn" type="button" data-open="' + esc(it.k) + '">' + esc(it.pn) + '</button><p class="d">' + esc(it.d) + '</p>' +
      (tags ? '<div class="tags">' + tags + '</div>' : '') + '<div class="ft">' + avail(it) + '<span class="act">' + act + '</span></div></div></article>';
  }
  function render() {
    var all = list(), box = $('#grid');
    box.className = 'pgrid2' + (st.view === 'list' ? ' list' : '');
    $('#count').textContent = T('results', { n: all.length });
    $('#secNote').textContent = T('n:' + st.sec);
    $('#bomPanel').hidden = st.sec !== 'ind:spr';
    if (!all.length) {
      box.innerHTML = '<div class="empty" style="grid-column:1/-1">' + ico('src') + '<p><b>' + T('none') + '</b></p><p>' + T('noneHint') + '</p>' +
        (st.q ? '<button class="btn btn-g" type="button" data-req="' + esc(st.q) + '">' + T('reqThis', { q: esc(st.q) }) + '</button>' : '') +
        '<button class="clear-f" type="button" data-clear>' + T('clear') + '</button></div>';
      $('#moreBtn').hidden = true;
    } else {
      box.innerHTML = all.slice(0, st.limit).map(card).join('');
      $('#moreBtn').hidden = all.length <= st.limit;
    }
    facets();
  }
  function facets() {
    var b = base(st.sec);
    var defs = [['src', T('fAv'), ['stock', 'supmea', 'spare'], function (v) { return T(v); }],
                ['t', T('fType'), null, TT], ['mfr', T('fBrand'), null, function (v) { return v; }], ['cond', T('fCond'), ['new', 'used', 'ref'], function (v) { return T(v); }]];
    $('#facetBox').innerHTML = defs.map(function (d) {
      var c = {}; b.forEach(function (it) { if (it[d[0]] != null && it[d[0]] !== '') c[it[d[0]]] = (c[it[d[0]]] || 0) + 1; });
      var keys = (d[2] || Object.keys(c).sort(function (x, y) { return c[y] - c[x]; })).filter(function (v) { return c[v]; });
      if (d[0] !== 'src' && keys.length < 2 && !Object.keys(st.f[d[0]]).length) return '';
      return '<div class="facet"><h4>' + d[1] + '</h4>' + keys.map(function (v) {
        return '<label><input type="checkbox" data-f="' + d[0] + '" value="' + esc(v) + '"' + (st.f[d[0]][v] ? ' checked' : '') + '><span>' + esc(d[3](v)) + '</span><em>' + c[v] + '</em></label>';
      }).join('') + '</div>';
    }).join('');
    $('.st-grid').classList.toggle('nof', !$('#facetBox').innerHTML);
  }
  function counts() {
    ['ind', 'bld'].forEach(function (dv) {
      var seen = {};
      SECS[dv].forEach(function (s) { var r = base(s); r.forEach(function (it) { seen[it.k] = 1; }); var el = $('[data-sec="' + s + '"] b'); if (el) el.textContent = r.length; });
      var e = $('[data-div="' + dv + '"] .dn'); if (e) e.textContent = Object.keys(seen).length;
    });
  }
  function tabs() {
    $$('.div').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.div === st.div ? 'true' : 'false'); });
    $('#secTabs').innerHTML = SECS[st.div].map(function (s) { return '<button class="src" type="button" role="tab" data-sec="' + s + '" aria-selected="' + (s === st.sec) + '">' + T(s) + ' <b>–</b></button>'; }).join('');
    counts();
  }
  function go(sec, keep) {
    st.sec = sec; st.div = sec.split(':')[0]; st.limit = 24;
    if (!keep) st.f = nf();
    tabs(); render(); try { history.replaceState(null, '', '#' + sec.replace(':', '-')); } catch (e) {}
  }
  function refresh() { st.limit = 24; counts(); render(); }

  /* ---------- cart ---------- */
  function save() { store.set('ies_rfq', cart); renderCart(); }
  function addLine(line, qty) {
    var ex = cart.filter(function (l) { return l.k === line.k; })[0];
    if (ex) ex.qty += qty || 1; else { line.qty = qty || 1; cart.push(line); }
    save(); var f = $('.fab'); f.classList.remove('bump'); void f.offsetWidth; f.classList.add('bump');
    toast(T('toast', { pn: line.pn }));
  }
  function addItem(it, qty) { addLine({ k: it.k, pn: it.pn, d: (it.src === 'spare' ? it.mfr + ' — ' : '') + it.d, src: it.src === 'spare' ? 'sourcing' : it.src, img: it.img || '' }, qty); }
  function renderCart() {
    $('.fab .n').textContent = cart.length;
    $('#cartEmpty').hidden = !!cart.length; $('#cartForm').hidden = !cart.length; $('#drFt').hidden = !cart.length;
    $('#lines').innerHTML = cart.map(function (l, i) {
      var srcTxt = l.src === 'stock' ? T('stkTag') : l.src === 'supmea' ? T('supTag') : T('sourcing');
      return '<div class="line">' + (l.img ? '<img class="lim" src="' + BASE + esc(l.img) + '" alt="">' : '<span class="lim">' + ico('src') + '</span>') +
        '<div class="lt"><div><span class="src3">' + esc(srcTxt) + '</span> <span class="pn">' + esc(l.pn) + '</span></div><p class="d">' + esc(l.d || '') + '</p></div>' +
        '<div class="ctl"><span class="stepper"><button type="button" data-lstep="-1" data-i="' + i + '">−</button><input type="number" min="1" value="' + l.qty + '" data-lqty="' + i + '" aria-label="' + T('qty') + '"><button type="button" data-lstep="1" data-i="' + i + '">+</button></span>' +
        '<button class="rm" type="button" data-rm="' + i + '" aria-label="' + T('remove') + '">×</button></div>' +
        '<input class="note" type="text" data-lnote="' + i + '" value="' + esc(l.note || '') + '" placeholder="' + T('lineNote') + '"></div>';
    }).join('');
    $$('[data-add]').forEach(function (b) { var on = inCart(b.dataset.add); b.classList.toggle('done', on); if (b.classList.contains('add')) b.textContent = on ? '✓' : '+'; });
  }
  function rid() {
    var id = store.get('ies_rfq_id', null);
    if (!id) { var d = new Date(); id = 'RFQ-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); store.set('ies_rfq_id', id); }
    return id;
  }
  function openDrawer(on) { $('.drawer').classList.toggle('on', on); $('.scrim').classList.toggle('on', on || $('.modal').classList.contains('on')); if (on) { $('#rid').textContent = rid(); renderCart(); setTimeout(function () { $('.drawer .x').focus(); }, 50); } }
  function formData() { var o = {}; $$('input,textarea', $('#cartForm')).forEach(function (i) { o[i.name] = i.value.trim(); }); return o; }
  function rfqText(c) {
    var L = ['IES STORE – REQUEST FOR QUOTATION ' + rid(), '', 'Company: ' + c.company, 'Contact: ' + c.name, 'Phone: ' + c.phone, 'Email: ' + (c.email || '-'),
      'Delivery city: ' + (c.city || '-'), 'Project / PO ref: ' + (c.project || '-'), 'Required by: ' + (c.date || '-'), '', 'ITEMS:'];
    cart.forEach(function (l, i) { L.push((i + 1) + '. [' + l.src.toUpperCase() + '] ' + l.pn + ' × ' + l.qty + (l.d ? ' — ' + l.d : '') + (l.note ? ' | Note: ' + l.note : '')); });
    if (c.msg) L.push('', 'Message: ' + c.msg);
    L.push('', 'Sent from ' + location.href.split('#')[0]); return L.join('\n');
  }
  function csv() {
    var c = formData(), rows = [['RFQ', rid()], ['Company', c.company], ['Contact', c.name], ['Phone', c.phone], ['Email', c.email], [], ['#', 'Source', 'Part number / model', 'Description', 'Qty', 'Note']];
    cart.forEach(function (l, i) { rows.push([i + 1, l.src, l.pn, l.d || '', l.qty, l.note || '']); });
    var s = '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv' })); a.download = rid() + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  }
  function valid() { var c = formData(); if (!c.company || !c.name || !c.phone) { $('#formMsg').textContent = T('need'); $('#formMsg').hidden = false; return null; } $('#formMsg').hidden = true; return c; }
  function mail(c) { location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(rid() + ' — ' + c.company) + '&body=' + encodeURIComponent(rfqText(c)); }
  function wa(c) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(rfqText(c)), '_blank', 'noopener'); }
  function done(msg) { $('#done').textContent = msg; $('#done').hidden = false; store.set('ies_rfq_last', { id: rid(), lines: cart }); cart = []; store.set('ies_rfq_id', null); save(); $('#cartEmpty').hidden = true; }
  function send() {
    var c = valid(); if (!c) return;
    if (!LIVE) { mail(c); done(T('okTest', { id: rid() })); return; }
    var b = $('#sendBtn'); b.disabled = true; b.textContent = T('sending');
    fetch(BASE + 'api/rfq.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rid(), lang: AR ? 'ar' : 'en', customer: c, lines: cart, page: location.href, hp: $('#hp').value }) })
      .then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw 0; done(T('okLive', { id: j.id || rid() })); })
      .catch(function () { $('#formMsg').textContent = T('fail'); $('#formMsg').hidden = false; })
      .then(function () { b.disabled = false; b.textContent = T('send'); });
  }

  /* ---------- detail modal ---------- */
  function modal(html) { $('.modal .box').innerHTML = html; $('.modal').classList.add('on'); $('.scrim').classList.add('on'); setTimeout(function () { var x = $('.modal .x'); if (x) x.focus(); }, 30); }
  function closeModal() { $('.modal').classList.remove('on'); if (!$('.drawer').classList.contains('on')) $('.scrim').classList.remove('on'); }
  function kv(k, v) { return '<div><small>' + esc(k) + '</small><b class="ltr">' + esc(v) + '</b></div>'; }
  function sel(name, label, opts) {
    if (opts === 'DN') return '<label>' + T('range') + '<input name="' + name + '" placeholder="' + T('dn') + '"></label>';
    if (opts === 'RANGE') return '<label>' + T('range') + '<input name="' + name + '" placeholder="' + T('prange') + '"></label>';
    return '<label>' + label + '<select name="' + name + '"><option value="">—</option>' + (opts || []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label>';
  }
  function open(k) {
    var it = BYK[k]; if (!it) return;
    var head = '<div class="m-top">' + pic(it, 'big') + '<div class="m-h2"><div class="mf">' + esc(it.mfr) + ' · ' + esc(TT(it.t)) + '</div><div class="pn">' + esc(it.pn) + '</div><p>' + esc(it.d) + '</p>' + avail(it) + '</div>' +
      '<button class="x dk" type="button" data-close aria-label="Close">×</button></div>';
    var body, foot;
    if (it.src === 'supmea') {
      var o = it.opt;
      body = '<ul class="spec big">' + it.s.map(function (x) { return '<li class="ltr">' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<form class="cfg" id="cfgForm">' + sel('range', T('range'), o.size || o.range) + sel('out', T('out'), o.out) + sel('conn', T('conn'), o.conn) +
        '<label>' + T('qty') + '<input name="qty" type="number" min="1" value="1"></label><label class="w">' + T('notes') + '<textarea name="note" rows="2"></textarea></label></form><div class="code" id="cfgCode">' + esc(it.pn) + '</div>';
      foot = (it.ds ? '<a class="btn btn-l" href="' + esc(it.ds) + '" target="_blank" rel="noopener">↗ ' + T('ds') + '</a>' : '') + '<span class="note2">' + T('cfgNote') + ' ' + T('lead') + ': ' + T('weeks', { w: it.lead }) + '.</span><button class="btn btn-g" type="button" data-cfgadd="' + esc(it.k) + '">' + T('add') + '</button>';
    } else {
      body = it.src === 'stock' ? '<div class="tags">' + tag(it.cond, T(it.cond)) + tag(it.life, T(it.life)) + '</div><div class="kv">' + kv(T('mfr'), it.mfr) + kv(T('cat'), TT(it.t)) + kv(T('coo'), it.coo || '—') + kv(T('hs'), it.hs || '—') + kv(T('code'), it.id) + kv(T('price'), T('onQuote')) + (it.succ ? kv(T('succ'), it.succ) : '') + '</div>'
        : '<div class="kv">' + kv(T('mfr'), it.mfr) + kv(T('cat'), TT(it.t)) + kv(T('price'), T('onQuote')) + '</div><p class="fine">' + T('indep') + '</p>';
      foot = '<button class="btn btn-l" type="button" data-share="' + esc(it.pn) + '">' + T('share') + '</button><span class="note2">' + T('imgNote') + '</span>' + stepper(it.k) + '<button class="btn btn-g" type="button" data-add="' + esc(it.k) + '" data-close>' + T('add') + '</button>';
    }
    modal(head + '<div class="m-b">' + body + '</div><div class="m-f">' + foot + '</div>');
    var f = $('#cfgForm'); if (f) f.addEventListener('input', function () { $('#cfgCode').textContent = cfgSummary(it, f); });
  }
  function cfgSummary(it, f) { var v = new FormData(f), p = [it.pn]; ['range', 'out', 'conn'].forEach(function (k) { if (v.get(k)) p.push(v.get(k)); }); return p.join(' | '); }

  /* ---------- BOM ---------- */
  function parseBom() {
    var a = 0, b = 0, c = 0, log = [];
    $('#bom').value.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim(); if (!line) return;
      var m = line.match(/^(.*?)[\s,;\t]+(?:x|qty[:\s]*|×)?\s*(\d{1,5})\s*(?:pcs|pc|ea|x)?$/i), pn = line, q = 1;
      if (m && m[1].trim().length >= 3) { pn = m[1].trim().replace(/[,;]$/, ''); q = parseInt(m[2], 10); }
      pn = pn.replace(/^\d+[.)]\s+/, ''); a++;
      var np = norm(pn), hit = ITEMS.filter(function (it) { return it.src === 'stock' && norm(it.pn) === np; })[0];
      if (hit) { b++; addItem(hit, q); log.push('<div class="ok">✓ ' + esc(hit.pn) + ' × ' + q + ' — ' + T('found') + '</div>'); return; }
      c++;
      var sp = ITEMS.filter(function (it) { return it.src === 'spare' && (norm(it.pn) === np || norm(it.pn.split(' ')[0]) === np); })[0];
      if (sp) { addItem(sp, q); log.push('<div class="src2">→ ' + esc(sp.pn) + ' × ' + q + ' — ' + T('listed') + '</div>'); }
      else { addLine({ k: 'X:' + np, pn: pn, d: $('#bomBrand').value || '', src: 'sourcing' }, q); log.push('<div class="src2">→ ' + esc(pn) + ' × ' + q + ' — ' + T('toSource') + '</div>'); }
    });
    if (a) { $('#bomLog').innerHTML = '<p><b>' + T('lines', { a: a, b: b, c: c }) + '</b></p>' + log.join(''); $('#bom').value = ''; }
  }
  var tt; function toast(m) { var t = $('.toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2000); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,a'); if (!t) return;
    var d = t.dataset;
    if (d.div) go(SECS[d.div][0], true);
    else if (d.sec) go(d.sec);
    else if (d.jump) { openDrawer(false); go(d.jump); $('#catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (d.chip) { $('#q').value = d.chip; st.q = d.chip; go(d.to); $('#catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (d.step) { var inp = t.parentNode.querySelector('input'); inp.value = Math.max(1, (parseInt(inp.value, 10) || 1) + parseInt(d.step, 10)); }
    else if (d.add) { var it = BYK[d.add], qi = $('[data-qty="' + d.add + '"]', t.closest('.prod,.box')); if (it) addItem(it, qi ? parseInt(qi.value, 10) || 1 : 1); if ('close' in d) closeModal(); }
    else if (d.open) open(d.open);
    else if (d.cfgadd) {
      var sp = BYK[d.cfgadd], f = $('#cfgForm'), v = new FormData(f), spec = cfgSummary(sp, f);
      addLine({ k: 'P:' + spec, pn: sp.pn, d: sp.d + (spec !== sp.pn ? ' — ' + spec.split(' | ').slice(1).join(', ') : ''), note: v.get('note') || '', src: 'supmea', img: sp.img || '' }, parseInt(v.get('qty'), 10) || 1);
      closeModal();
    }
    else if ('close' in d) closeModal();
    else if (d.req) { addLine({ k: 'X:' + norm(d.req), pn: d.req, d: '', src: 'sourcing' }, 1); openDrawer(true); }
    else if ('clear' in d) { st.f = nf(); st.q = ''; $('#q').value = ''; refresh(); }
    else if (d.view) { st.view = d.view; store.set('ies_store_view', st.view); $$('.view-tg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === st.view ? 'true' : 'false'); }); render(); }
    else if (t.id === 'moreBtn') { st.limit += 24; render(); }
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
    if (e.key === '/' && ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) < 0) { e.preventDefault(); $('#q').focus(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, d = t.dataset;
    if (d.f) { if (t.checked) st.f[d.f][t.value] = 1; else delete st.f[d.f][t.value]; st.limit = 24; render(); }
    else if (d.lqty != null) { cart[+d.lqty].qty = Math.max(1, parseInt(t.value, 10) || 1); save(); }
    else if (d.lnote != null) { cart[+d.lnote].note = t.value; store.set('ies_rfq', cart); }
    else if (t.id === 'sort') { st.sort = t.value; render(); }
  });
  var qt; $('#q').addEventListener('input', function (e) {
    clearTimeout(qt); qt = setTimeout(function () {
      st.q = e.target.value; st.limit = 24;
      if (st.q && !base(st.sec).length) { var best = ALLSECS.filter(function (s) { return base(s).length; })[0]; if (best) { go(best, true); return; } }
      counts(); render();
    }, 120);
  });
  $('#q').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#catalog').scrollIntoView({ behavior: 'smooth' }); });

  /* ---------- boot ---------- */
  fetch(BASE + 'data/catalog.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
    ITEMS = j.items; ITEMS.forEach(function (it) { BYK[it.k] = it; });
    var n = function (src) { return ITEMS.filter(function (i) { return i.src === src; }).length; };
    $('#k-stock').textContent = n('stock'); $('#k-sup').textContent = n('supmea'); $('#k-src').textContent = n('spare');
    var brands = {}; ITEMS.forEach(function (i) { if (i.src === 'spare') brands[i.mfr] = 1; });
    $('#brandList').innerHTML = Object.keys(brands).map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('');
    $('#bomBrand').innerHTML = '<option value="">—</option>' + Object.keys(brands).map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    $('#upd').textContent = j.generated;
    var p = new URLSearchParams(location.search); if (p.get('q')) { st.q = p.get('q'); $('#q').value = st.q; }
    var h = location.hash.slice(1).replace('-', ':'); if (ALLSECS.indexOf(h) < 0) h = 'ind:ctl';
    $$('.view-tg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === st.view ? 'true' : 'false'); });
    go(h, true); renderCart();
  });
})();
