#!/usr/bin/env python3
"""Generate store/index.html (EN) and ar/store/index.html (AR).
Usage: build_store_pages.py <repo> <base_url> <release_id> <status Test|Active> <noindex 1|0>"""
import sys, os, datetime
repo, base, rel, status, noindex = sys.argv[1], sys.argv[2].rstrip('/'), sys.argv[3], sys.argv[4], sys.argv[5] == '1'
V = rel.split("-")[-1].lower() + (sys.argv[6] if len(sys.argv) > 6 else "")  # cache tag e.g. r7
today = datetime.date.today().isoformat()

T = {
 'en': dict(
  title='IES Store | Automation spares, Siemens stock & Supmea instruments, Iraq',
  desc='Request a quotation for PLC, DCS and safety-system spares, in-stock Siemens items in Baghdad and Supmea process instruments. Al-Khadraa IES, Iraq.',
  home='index.html', brand_b='Al-Khadraa IES', brand_s='Integrated Engineering Services', logo_alt='IES logo', menu='Menu', mainnav='Main',
  nav=[('Services','index.html#capabilities'),('Projects','projects.html'),('Store','store/'),('Help','store/help/'),('Contact','index.html#contact')],
  lang_href='../ar/store/', lang_lbl='عربي', lang_code='ar', cta='Request a quote',
  live='IES Store · Phase 1 · Quotation only',
  h1='Automation parts, found and quoted <span style="color:var(--green)">in one working day.</span>',
  lead='Search IES stock in Baghdad, configure Supmea process instruments, or paste a list of legacy DCS / PLC part numbers. Build one request and our engineers reply with a quotation.',
  ph='Search part number, model or description…', console='parts.query', ready='ready',
  chips=[('6ES7','ind:ctl'),('ET 200','ind:ctl'),('Radar','ind:ins'),('Triconex','ind:spr'),('Desigo','bld:bms'),('KNX','bld:knx'),('Detector','bld:fire')],
  k1='Items in Baghdad stock', k2='Supmea models', k3='Legacy spares listed', k1e='Ready', k2e='Import', k3e='Sourcing',
  trust=['Prices in the quotation (USD / IQD)','Payment: Qi Card transfer, bank transfer or PO','Delivery across Iraq'],
  d_ind='Industrial', d_ind_s='Control systems · Instruments · Legacy spares', d_bld='Building', d_bld_s='BMS · KNX · Fire alarm · Instruments', items='items',
  t_stock='In stock · Baghdad', t_sup='Supmea instruments', t_src='Legacy DCS / PLC spares', grid='Grid view', list='List view',
  filters='Filters', clear='Clear filters', cat='Category', cond='Condition', life='Lifecycle', sort='Sort',
  s_rel='Best match', s_pn='Part number A–Z', s_qty='Most available', more='Show more',
  stock_note='Items in our Baghdad warehouse. Quantities update from the IES warehouse system; prices are given in the quotation.',
  fam=[('all','All'),('flow','Flow'),('level','Level'),('press','Pressure'),('temp','Temperature'),('anal','Water analysis'),('rec','Recorders')],
  sup_note='Supmea process instruments are imported to order for IES projects and customers in Iraq. Choose the options you know; our engineers confirm the final order code and datasheet in the quotation.',
  brand='Brand', src_note='Representative part numbers from our sourcing partners. Thousands more are available — search below or paste your list.',
  bom_h='Paste your part list', bom_p='One part number per line, with quantity if known. Items found in IES stock are matched automatically; the rest are added for sourcing.',
  bom_brand='Brand (optional)', bom_btn='Check & add to RFQ',
  how_h='How sourcing works', how=['Send the part numbers you need — any brand, any age.','We locate new-surplus or refurbished units and confirm condition, revision and lead time.','You receive one IES quotation, with test report and IES warranty.'],
  disc='Brand names and part numbers identify products only. Legacy spares are supplied from independent stock, not as manufacturer-authorised supply.',
  rfq='Your RFQ', close='Close', empty='Your RFQ is empty. Add items from stock, configure a Supmea instrument or paste part numbers.', browse='Browse stock',
  company='Company *', name='Contact name *', phone='Phone / WhatsApp *', email='Email', city='Delivery city', proj='Project / PO reference', date='Required by', msg='Message',
  send='Send RFQ', alt_mail='Email', alt_wa='WhatsApp', alt_csv='Download (CSV)', reply='IES engineers reply with a quotation within one working day (Saturday–Thursday).',
  fab='RFQ', test='Test site — RFQs from here open your email app or WhatsApp. Stock list as of', copy='© {y} Al-Khadraa Integrated Engineering Services Co. Ltd.',
  fnav=[('Services','index.html#capabilities'),('Projects','projects.html'),('Store','store/'),('Help','store/help/'),('Contact','index.html#contact')], flang=('../ar/store/','العربية','ar'),
 ),
 'ar': dict(
  title='متجر IES | قطع غيار الأتمتة، مخزون سيمنس وأجهزة Supmea في العراق',
  desc='اطلب عرض سعر لقطع غيار PLC وDCS وأنظمة السلامة، ومواد سيمنس المتوفرة في بغداد، وأجهزة القياس من Supmea. شركة الخضراء للخدمات الهندسية المتكاملة.',
  home='index.html', brand_b='الخضراء للخدمات الهندسية', brand_s='الخدمات الهندسية المتكاملة', logo_alt='شعار IES', menu='القائمة', mainnav='القائمة الرئيسية',
  nav=[('خدماتنا','index.html#capabilities'),('المشاريع','projects.html'),('المتجر','store/'),('المساعدة','store/help/'),('تواصل معنا','index.html#contact')],
  lang_href='../../store/', lang_lbl='English', lang_code='en', cta='اطلب عرض سعر',
  live='متجر IES · المرحلة الأولى · عروض أسعار فقط',
  h1='قطع الأتمتة، نجدها ونسعّرها <span style="color:var(--green)">خلال يوم عمل واحد.</span>',
  lead='ابحث في مخزن IES في بغداد، أو اختر مواصفات أجهزة Supmea، أو الصق قائمة بأرقام قطع DCS / PLC القديمة. أنشئ طلباً واحداً ويرد مهندسونا بعرض سعر.',
  ph='ابحث برقم القطعة أو الموديل أو الوصف…', console='parts.query', ready='جاهز',
  chips=[('6ES7','ind:ctl'),('ET 200','ind:ctl'),('Radar','ind:ins'),('Triconex','ind:spr'),('Desigo','bld:bms'),('KNX','bld:knx'),('Detector','bld:fire')],
  k1='مادة في مخزن بغداد', k2='موديل Supmea', k3='قطعة غيار مدرجة', k1e='جاهز', k2e='استيراد', k3e='توفير',
  trust=['الأسعار في عرض السعر (دولار / دينار)','الدفع: تحويل كي كارد أو تحويل مصرفي أو أمر شراء','التوصيل إلى جميع محافظات العراق'],
  d_ind='القطاع الصناعي', d_ind_s='أنظمة التحكم · أجهزة القياس · قطع الغيار القديمة', d_bld='قطاع المباني', d_bld_s='BMS · KNX · إنذار الحريق · أجهزة القياس', items='مادة',
  t_stock='متوفر في مخزن بغداد', t_sup='أجهزة Supmea', t_src='قطع غيار DCS / PLC القديمة', grid='عرض شبكي', list='عرض قائمة',
  filters='الفلاتر', clear='مسح الفلاتر', cat='الفئة', cond='الحالة', life='دورة حياة المنتج', sort='الترتيب',
  s_rel='الأكثر تطابقاً', s_pn='رقم القطعة أ–ي', s_qty='الأكثر توفراً', more='عرض المزيد',
  stock_note='مواد موجودة في مخزننا في بغداد. تُحدَّث الكميات من نظام مخزن IES، وتُذكر الأسعار في عرض السعر.',
  fam=[('all','الكل'),('flow','الجريان'),('level','المنسوب'),('press','الضغط'),('temp','الحرارة'),('anal','تحليل المياه'),('rec','المسجلات')],
  sup_note='تُستورد أجهزة Supmea حسب الطلب لمشاريع وزبائن IES في العراق. اختر ما تعرفه من المواصفات، ويؤكد مهندسونا رمز الطلب النهائي وورقة المواصفات في عرض السعر.',
  brand='العلامة التجارية', src_note='أرقام قطع نموذجية من شركائنا في التوفير، وتتوفر آلاف القطع الأخرى — ابحث أدناه أو الصق قائمتك.',
  bom_h='الصق قائمة القطع', bom_p='رقم قطعة في كل سطر مع الكمية إن وجدت. تُطابَق المواد المتوفرة في مخزن IES تلقائياً، ويُضاف الباقي للتوفير.',
  bom_brand='العلامة التجارية (اختياري)', bom_btn='تحقق وأضف إلى الطلب',
  how_h='كيف يعمل التوفير', how=['أرسل أرقام القطع التي تحتاجها — أي علامة تجارية وأي عمر.','نحدد وحدات جديدة فائضة أو مجددة ونؤكد الحالة والإصدار ومدة التوريد.','تستلم عرض سعر واحداً من IES مع تقرير الفحص وضمان IES.'],
  disc='تُستخدم الأسماء التجارية وأرقام القطع لتعريف المنتجات فقط. تُجهَّز قطع الغيار القديمة من مخزون مستقل وليس كتوريد معتمد من الشركة المصنعة.',
  rfq='طلب التسعير', close='إغلاق', empty='طلبك فارغ. أضف مواد من المخزن أو اختر جهاز Supmea أو الصق أرقام القطع.', browse='تصفح المخزن',
  company='الشركة *', name='اسم الشخص المسؤول *', phone='الهاتف / واتساب *', email='البريد الإلكتروني', city='مدينة التسليم', proj='المشروع / رقم أمر الشراء', date='مطلوب قبل', msg='رسالة',
  send='أرسل طلب التسعير', alt_mail='بريد', alt_wa='واتساب', alt_csv='تنزيل (CSV)', reply='يرد مهندسو IES بعرض سعر خلال يوم عمل واحد (السبت–الخميس).',
  fab='الطلب', test='موقع تجريبي — طلبات التسعير من هنا تفتح البريد أو واتساب. قائمة المخزن بتاريخ', copy='© {y} شركة الخضراء للخدمات الهندسية المتكاملة المحدودة',
  fnav=[('خدماتنا','index.html#capabilities'),('المشاريع','projects.html'),('المتجر','store/'),('المساعدة','store/help/'),('تواصل معنا','index.html#contact')], flang=('../../store/','English','en'),
 )}

def page(lang):
    t = T[lang]; ar = lang == 'ar'
    up = '../../' if ar else '../'          # to repo root
    site = '../' if ar else '../'           # to language home (ar/ or root)
    store_base = up + 'store/'
    path = 'ar/store/' if ar else 'store/'
    url = f'{base}/{path}'
    def L(h):  # link relative to language home
        if h == 'store/help/': return 'help/'
        if h.startswith('store/'): return './'
        return site + h
    nav = ''.join(f'<a href="{L(h)}"' + (' aria-current="page"' if h == 'store/' else '') + f'>{n}</a>' for n, h in t['nav'])
    fnav = ''.join(f'<a href="{L(h)}">{n}</a>' for n, h in t['fnav'])
    chips = ''.join(f'<button type="button" data-chip="{c}" data-to="{to}">{c}</button>' for c, to in t['chips'])
    fam = '' and ''.join(f'<button class="ftab" type="button" data-fam="{k}" aria-pressed="{"true" if k=="all" else "false"}">{n}</button>' for k, n in t['fam'])
    how = ''.join(f'<li>{x}</li>' for x in t['how'])
    trust = ''.join(f'<span>{x}</span>' for x in t['trust'])
    robots = '<meta name="robots" content="noindex, nofollow">\n' if noindex else ''
    other = f'{base}/store/' if ar else f'{base}/ar/store/'
    testbar = f'<div class="testbar" id="testbar">{t["test"]} <span id="upd" class="ltr"></span></div>' if status == 'Test' else '<span id="upd" hidden></span>'
    return f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if ar else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="ies-site-id" content="{rel}">
<meta name="ies-site-release" content="{today}">
{robots}<meta name="ies-site-status" content="{status}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{base}/store/">
<link rel="alternate" hreflang="ar" href="{base}/ar/store/">
<title>{t['title']}</title>
<meta name="description" content="{t['desc']}">
<link rel="icon" href="{up}favicon.ico">
<link rel="icon" type="image/png" href="{up}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&amp;family=Inter:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400;500{'&amp;family=IBM+Plex+Sans+Arabic:wght@400;500;600;700' if ar else ''}&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}assets/css/style.css?v={V}">
<link rel="stylesheet" href="{store_base}assets/store.css?v={V}">
<meta property="og:type" content="website">
<meta property="og:title" content="{t['title']}">
<meta property="og:description" content="{t['desc']}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://al-khadraa.com/assets/img/og.jpg">
</head>
<body data-store-base="{store_base}">
{testbar}
<a class="skip" href="#catalog">Skip to content</a>
<header class="hdr">
<div class="wrap">
<a class="brand" href="{site}index.html" aria-label="{t['brand_b']}">
<img src="{up}assets/img/logo-color.png" alt="{t['logo_alt']}" width="63" height="52">
<span><b>{t['brand_b']}</b><small>{t['brand_s']}</small></span>
</a>
<button class="menu-btn" type="button" aria-label="{t['menu']}" aria-expanded="false" aria-controls="nav"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
<nav class="nav" id="nav" aria-label="{t['mainnav']}">
{nav}
<a class="lang" href="{t['lang_href']}" lang="{t['lang_code']}" hreflang="{t['lang_code']}">{t['lang_lbl']}</a>
<button class="btn btn-g" type="button" data-cart>{t['cta']}</button>
</nav>
</div>
</header>

<main id="main">
<section class="st-hero dark" aria-labelledby="h1">
<div class="wrap">
<div class="st-copy">
<div class="live"><span class="dot"></span>{t['live']}</div>
<h1 id="h1">{t['h1']}</h1>
<p class="lead">{t['lead']}</p>
<div class="trust">{trust}</div>
</div>
<div style="display:flex;flex-direction:column;gap:14px">
<div class="console" role="search">
<div class="console-top"><i></i><i></i><i></i>&nbsp; {t['console']}<span>● {t['ready']}</span></div>
<div class="scan"></div>
<label class="qbox"><span class="pr" aria-hidden="true">&gt;</span><input id="q" type="search" placeholder="{t['ph']}" autocomplete="off" spellcheck="false" aria-label="{t['ph']}"><kbd>/</kbd></label>
<div class="qchips">{chips}</div>
</div>
<div class="kpis">
<button class="kpi" type="button" data-jump="ind:ctl"><em>{t['k1e']}</em><strong id="k-stock">–</strong><small>{t['k1']}</small></button>
<button class="kpi" type="button" data-jump="ind:ins"><em>{t['k2e']}</em><strong id="k-sup">–</strong><small>{t['k2']}</small></button>
<button class="kpi" type="button" data-jump="ind:spr"><em>{t['k3e']}</em><strong id="k-src">–</strong><small>{t['k3']}</small></button>
</div>
</div>
</div>
</section>

<section class="divs" id="catalog" aria-label="Divisions">
<div class="wrap divrow">
<button class="div ind" type="button" data-div="ind" aria-selected="true"><span class="dv-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21h20M4 21V10l5 3V10l5 3V6l6 4v11"/><path d="M8 17h1M12 17h1M16 17h1"/></svg></span><span class="dv-t"><b>{t['d_ind']}</b><small>{t['d_ind_s']}</small></span><span class="dn">–</span></button>
<button class="div bld" type="button" data-div="bld" aria-selected="false"><span class="dv-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2M10 22v-4h4v4"/></svg></span><span class="dv-t"><b>{t['d_bld']}</b><small>{t['d_bld_s']}</small></span><span class="dn">–</span></button>
</div>
</section>
<div class="srcbar">
<div class="wrap"><div id="secTabs" role="tablist" style="display:flex;gap:8px"></div>
<span class="sp"></span>
<div class="view-tg"><button type="button" data-view="grid" aria-label="{t['grid']}" title="{t['grid']}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button><button type="button" data-view="list" aria-label="{t['list']}" title="{t['list']}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg></button></div>
</div>
</div>

<section class="st-main">
<div class="wrap">
<div class="srcx" id="bomPanel" hidden style="margin-bottom:32px">
<div class="panel2">
<h3>{t['bom_h']}</h3>
<p>{t['bom_p']}</p>
<textarea class="bom" id="bom" spellcheck="false" placeholder="6ES7 315-2EH14-0AB0   2&#10;IC697CPU731, 1&#10;CC-PAIH01 51405038-175 x3"></textarea>
<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><select id="bomBrand" aria-label="{t['bom_brand']}" style="font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:10px;min-height:46px"></select><button class="btn btn-g" type="button" id="bomBtn">{t['bom_btn']}</button></div>
<div class="matchlog" id="bomLog"></div>
</div>
<div class="panel2 dk">
<h3 style="color:#fff">{t['how_h']}</h3>
<ol class="steps2">{how}</ol>
<div class="brands" id="brandList"></div>
<p class="disc">{t['disc']}</p>
</div>
</div>
<div class="st-grid">
<aside class="facets" aria-label="{t['filters']}">
<div style="display:flex;justify-content:space-between;align-items:center"><button class="clear-f" type="button" data-clear>{t['clear']}</button><button class="clear-f fbtn-m" type="button" id="fClose">✕</button></div>
<div id="facetBox"></div>
</aside>
<div>
<p class="fam-note" id="secNote"></p>
<div class="resbar"><span class="count" id="count"></span><span style="display:flex;gap:8px"><button class="btn btn-l fbtn-m" type="button" id="fOpen" style="padding:8px 14px;min-height:42px">{t['filters']}</button>
<select id="sort" aria-label="{t['sort']}"><option value="rel">{t['s_rel']}</option><option value="pn">{t['s_pn']}</option><option value="qty">{t['s_qty']}</option></select></span></div>
<div class="pgrid2" id="grid"></div>
<div class="more-btn"><button class="btn btn-l" type="button" id="moreBtn" hidden>{t['more']}</button></div>
</div>
</div>
</div>
</section>
</main>

<button class="fab" type="button" aria-label="{t['rfq']}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2h6l1 3h3v17H5V5h3z"/><path d="M9 12h6M9 16h4"/></svg><span class="lbl">{t['fab']}</span><span class="n">0</span></button>
<div class="scrim"></div>
<aside class="drawer" aria-label="{t['rfq']}">
<div class="dr-h"><div><h2>{t['rfq']}</h2><div class="rid" id="rid"></div></div><button class="x" type="button" aria-label="{t['close']}">×</button></div>
<div class="dr-b">
<div class="done-box" id="done" hidden></div>
<div class="empty-cart" id="cartEmpty"><p>{t['empty']}</p><button class="btn btn-d" type="button" data-jump="ind:ctl">{t['browse']}</button></div>
<div class="lines" id="lines"></div>
<form class="dr-f" id="cartForm" hidden onsubmit="return false">
<label>{t['company']}<input name="company" required autocomplete="organization"></label>
<label>{t['name']}<input name="name" required autocomplete="name"></label>
<label>{t['phone']}<input name="phone" type="tel" required autocomplete="tel" class="ltr"></label>
<label>{t['email']}<input name="email" type="email" autocomplete="email" class="ltr"></label>
<label>{t['city']}<input name="city"></label>
<label>{t['proj']}<input name="project"></label>
<label>{t['date']}<input name="date" type="date"></label>
<label class="hpf" aria-hidden="true">Website<input id="hp" name="hp" tabindex="-1" autocomplete="off"></label>
<label class="w">{t['msg']}<textarea name="msg" rows="3"></textarea></label>
</form>
</div>
<div class="dr-ft" id="drFt" hidden>
<p class="note" id="formMsg" hidden style="margin:0;color:#A33;font-size:14px"></p>
<button class="btn btn-g" type="button" id="sendBtn">{t['send']}</button>
<div class="alt"><button class="btn btn-l" type="button" id="mailBtn">{t['alt_mail']}</button><button class="btn btn-l" type="button" id="waBtn">{t['alt_wa']}</button><button class="btn btn-l" type="button" id="csvBtn">{t['alt_csv']}</button></div>
<small>{t['reply']}</small>
</div>
</aside>
<div class="modal" role="dialog" aria-modal="true"><div class="box"></div></div>
<div class="toast" role="status" aria-live="polite"></div>

<footer class="ftr">
<div class="wrap">
<span>{t['copy'].format(y='<span class="yr">2026</span>')}</span>
<nav aria-label="Footer">{fnav}<a href="{t['flang'][0]}" lang="{t['flang'][2]}">{t['flang'][1]}</a></nav>
</div>
</footer>
<script src="{up}assets/js/main.js?v={V}"></script>
<script src="{store_base}assets/store.js?v={V}"></script>
</body>
</html>
'''

for lang, out in (('en', 'store/index.html'), ('ar', 'ar/store/index.html')):
    p = os.path.join(repo, out); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(page(lang))
    print('wrote', out)
