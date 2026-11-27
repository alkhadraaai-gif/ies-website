#!/usr/bin/env python3
"""Generate the customer Help pages of the IES Store: store/help/index.html (EN) and ar/store/help/index.html (AR).
Usage: build_store_help.py <repo> <base_url> <release_id> <status Test|Active> <noindex 1|0> [cache suffix]
Pictures: store/help/img/*.webp (made by tools/help_shots.py). Both languages are written out in full here."""
import sys, os, datetime, html
repo, base, rel, status, noindex = sys.argv[1], sys.argv[2].rstrip('/'), sys.argv[3], sys.argv[4], sys.argv[5] == '1'
V = rel.split('-')[-1].lower() + (sys.argv[6] if len(sys.argv) > 6 else '')
today = datetime.date.today().isoformat()

# Each section: (id, title, html body, picture or None)
EN = dict(
  title='IES Store help | How to find parts and request a quotation',
  desc='How to use the IES Store: search, filters, availability, Supmea instrument configuration, pasting a part list and sending a request for quotation.',
  brand_b='Al-Khadraa IES', brand_s='Integrated Engineering Services', logo_alt='IES logo', menu='Menu', mainnav='Main',
  nav=[('Services', 'index.html#capabilities'), ('Projects', 'projects.html'), ('Store', 'store/'), ('Help', 'store/help/'), ('Contact', 'index.html#contact')],
  lang_href='../../ar/store/help/', lang_lbl='عربي', lang_code='ar', cta='Back to the store',
  kicker='IES Store · Help', h1='How to use the IES Store',
  lead='Find automation parts and instruments, build one request and receive an IES quotation within one working day. No account and no online payment are needed.',
  toc='Contents', top='Back to top', video='Video guides (Arabic) are available from IES on request.',
  copy='© {y} Al-Khadraa Integrated Engineering Services Co. Ltd.',
  fnav=[('Services', 'index.html#capabilities'), ('Projects', 'projects.html'), ('Store', 'store/'), ('Contact', 'index.html#contact')], flang=('../../ar/store/help/', 'العربية', 'ar'),
  secs=[
   ('about', 'What the store is', '''<p>The IES Store is a <b>quotation store</b> (Phase 1). You choose items and send a request for quotation (RFQ). IES engineers check availability, condition and lead time and send you a written quotation with prices in USD or IQD.</p>
<ul><li><b>Payment</b> after you accept the quotation: Qi Card transfer, bank transfer or purchase order (PO).</li>
<li><b>Delivery</b> across Iraq from our Baghdad warehouse, or imported to order.</li>
<li><b>Reply time:</b> one working day (Saturday–Thursday, 08:00–16:00 Baghdad time).</li></ul>''', None),
   ('find', 'Find a part', '''<ol><li>Type a part number, model or description in the search box at the top (for example <code>6ES7</code>, <code>radar</code>, <code>Triconex</code>). Spaces and dashes do not matter.</li>
<li>Or press one of the quick chips under the search box.</li>
<li>Choose the division: <b>Industrial</b> (control systems, instruments, legacy spares) or <b>Building</b> (BMS, KNX, fire alarm, instruments).</li>
<li>Choose a section tab. The number on each tab shows how many items it holds.</li></ol>
<p>Nothing found? Press <b>Request “…”</b> under the empty result: your search text is added to the RFQ and we source it for you.</p>''', 'search'),
   ('filters', 'Filters, sorting and views', '''<ul><li><b>Availability</b> – In stock (Baghdad), 4–6 weeks delivery (Supmea) or Sourced on request (legacy spares).</li>
<li><b>Product type</b>, <b>Brand</b> and <b>Condition</b> narrow the list; the small number shows how many items match.</li>
<li><b>Clear filters</b> removes all filters. On a phone, open the filters with the <b>Filters</b> button.</li>
<li>Sort by best match, part number or most available, and switch between grid and list view.</li></ul>''', 'filters'),
   ('avail', 'What the availability labels mean', '''<table class="hl"><tr><th>Label</th><th>Meaning</th></tr>
<tr><td><b>● 8 in stock</b></td><td>In our Baghdad warehouse now. The number is the quantity available.</td></tr>
<tr><td><b>4–6 weeks delivery</b></td><td>Supmea instrument, imported to order for your project.</td></tr>
<tr><td><b>On request · 1–3 weeks</b></td><td>Legacy DCS / PLC / SIS spare from independent stock. Condition, test report and IES warranty are stated in the quotation.</td></tr>
<tr><td><b>Used / old stock, Discontinued, Phase-out</b></td><td>Condition of the item and lifecycle status of the product at the manufacturer.</td></tr></table>
<p>Pictures identify the product; the supplied item may differ in revision or appearance. A “Representative picture” label means the picture shows the same product family.</p>''', None),
   ('add', 'Add items to your RFQ', '''<ol><li>Set the quantity with <b>−</b> and <b>+</b> on the card.</li>
<li>Press the green <b>+</b> button. It turns into <b>✓</b> and the RFQ counter at the side of the screen goes up.</li>
<li>Click the part number or the picture to see details: manufacturer, country of origin, HS code, lifecycle and successor.</li></ol>''', 'add'),
   ('supmea', 'Configure a Supmea instrument', '''<ol><li>Open <b>Instruments</b> and press <b>Configure &amp; add</b> on a Supmea model.</li>
<li>Choose what you know: size or range, output signal, process connection, quantity. Add notes such as medium, temperature or number of tags.</li>
<li>Press <b>Add to RFQ</b>. IES engineers confirm the final order code and send the datasheet with the quotation.</li></ol>
<p>The <b>Datasheet (PDF)</b> link opens the manufacturer datasheet.</p>''', 'supmea'),
   ('bom', 'Paste your part list (legacy spares)', '''<ol><li>Open <b>Industrial › Legacy Spares</b>.</li>
<li>Paste your list in the box: one part number per line, with the quantity after it if you know it (for example <code>3805E 2</code>).</li>
<li>Choose the brand if all parts are from one brand (optional) and press <b>Check &amp; add to RFQ</b>.</li></ol>
<p>Each line is checked: items found in IES stock are matched, listed spares are added, and the rest are added for sourcing. All lines go into one RFQ.</p>''', 'bom'),
   ('send', 'Send your RFQ', '''<ol><li>Press <b>Request a quote</b> (or the <b>RFQ</b> button at the side). Your RFQ opens with all lines.</li>
<li>Check quantities, remove lines you do not need and add a note to any line.</li>
<li>Fill in <b>Company</b>, <b>Contact name</b> and <b>Phone / WhatsApp</b> (required), and if you can: e-mail, delivery city, project or PO reference, required date and a message.</li>
<li>Press <b>Send RFQ</b>. You see your RFQ number (for example RFQ-261127-AB12). If you gave an e-mail address, you also receive a confirmation e-mail.</li></ol>
<p>You can also send the same RFQ by <b>e-mail</b> or <b>WhatsApp</b>, or download it as a CSV file for your own records.</p>''', 'send'),
   ('after', 'After you send', '''<ul><li>An IES engineer reviews the RFQ and replies by e-mail or WhatsApp within one working day, usually with the quotation.</li>
<li>Quote your RFQ number when you call or write to us.</li>
<li>Your RFQ is kept in the browser until you send it or empty it, so you can add items over several visits.</li></ul>''', None),
   ('privacy', 'Your data and product names', '''<ul><li>We use your contact details only to answer your request and to prepare the quotation. We do not sell or share them.</li>
<li>Brand names and part numbers identify products only. Legacy spares are supplied from independent stock, not as manufacturer-authorised supply.</li></ul>''', None),
   ('contact', 'Contact', '''<p>Al-Khadraa Integrated Engineering Services (IES) · Al-Yarmouk, Baghdad · Al Saady Street, Basra<br>
E-mail <a href="mailto:info@ies-iraq.com">info@ies-iraq.com</a> · Saturday–Thursday 08:00–16:00</p>''', None),
  ])

AR = dict(
  title='مساعدة متجر IES | كيف تجد القطع وتطلب عرض سعر',
  desc='طريقة استخدام متجر IES: البحث والفلاتر والتوفر واختيار مواصفات أجهزة Supmea ولصق قائمة القطع وإرسال طلب التسعير.',
  brand_b='الخضراء للخدمات الهندسية', brand_s='الخدمات الهندسية المتكاملة', logo_alt='شعار IES', menu='القائمة', mainnav='القائمة الرئيسية',
  nav=[('خدماتنا', 'index.html#capabilities'), ('المشاريع', 'projects.html'), ('المتجر', 'store/'), ('المساعدة', 'store/help/'), ('تواصل معنا', 'index.html#contact')],
  lang_href='../../../store/help/', lang_lbl='English', lang_code='en', cta='العودة إلى المتجر',
  kicker='متجر IES · المساعدة', h1='طريقة استخدام متجر IES',
  lead='ابحث عن قطع الأتمتة وأجهزة القياس، وأنشئ طلباً واحداً، واستلم عرض سعر من IES خلال يوم عمل واحد. لا تحتاج إلى حساب ولا إلى دفع إلكتروني.',
  toc='المحتويات', top='العودة إلى الأعلى', video='تتوفر أدلة فيديو باللغة العربية من IES عند الطلب.',
  copy='© {y} شركة الخضراء للخدمات الهندسية المتكاملة.',
  fnav=[('خدماتنا', 'index.html#capabilities'), ('المشاريع', 'projects.html'), ('المتجر', 'store/'), ('تواصل معنا', 'index.html#contact')], flang=('../../../store/help/', 'English', 'en'),
  secs=[
   ('about', 'ما هو المتجر', '''<p>متجر IES هو <b>متجر عروض أسعار</b> (المرحلة الأولى). تختار المواد وترسل طلب تسعير (RFQ)، فيتحقق مهندسو IES من التوفر والحالة ومدة التوريد ويرسلون لك عرض سعر مكتوباً بالدولار أو الدينار العراقي.</p>
<ul><li><b>الدفع</b> بعد قبول عرض السعر: تحويل كي كارد أو تحويل مصرفي أو أمر شراء (PO).</li>
<li><b>التوصيل</b> إلى جميع محافظات العراق من مخزننا في بغداد، أو بالاستيراد حسب الطلب.</li>
<li><b>مدة الرد:</b> يوم عمل واحد (السبت–الخميس، 08:00–16:00 بتوقيت بغداد).</li></ul>''', None),
   ('find', 'البحث عن قطعة', '''<ol><li>اكتب رقم القطعة أو الموديل أو الوصف في مربع البحث أعلى الصفحة (مثلاً <code>6ES7</code> أو <code>Radar</code> أو <code>Triconex</code>). المسافات والشرطات لا تؤثر.</li>
<li>أو اضغط على أحد الاختيارات السريعة تحت مربع البحث.</li>
<li>اختر القطاع: <b>القطاع الصناعي</b> (أنظمة التحكم، أجهزة القياس، قطع الغيار القديمة) أو <b>قطاع المباني</b> (BMS وKNX وإنذار الحريق وأجهزة القياس).</li>
<li>اختر التبويب المطلوب. الرقم على كل تبويب يبيّن عدد المواد فيه.</li></ol>
<p>لم تجد ما تبحث عنه؟ اضغط <b>اطلب «…»</b> تحت النتيجة الفارغة، فيُضاف نص البحث إلى الطلب ونوفّره لك.</p>''', 'search'),
   ('filters', 'الفلاتر والترتيب وطريقة العرض', '''<ul><li><b>التوفر</b> – متوفر في بغداد، أو التوريد خلال 4–6 أسابيع (Supmea)، أو يُوفَّر حسب الطلب (قطع الغيار القديمة).</li>
<li><b>نوع المنتج</b> و<b>العلامة التجارية</b> و<b>الحالة</b> تضيّق القائمة، والرقم الصغير يبيّن عدد المواد المطابقة.</li>
<li><b>مسح الفلاتر</b> يلغي كل الفلاتر. على الهاتف افتح الفلاتر من زر <b>الفلاتر</b>.</li>
<li>رتّب حسب الأكثر تطابقاً أو رقم القطعة أو الأكثر توفراً، وبدّل بين العرض الشبكي وعرض القائمة.</li></ul>''', 'filters'),
   ('avail', 'معنى علامات التوفر', '''<table class="hl"><tr><th>العلامة</th><th>المعنى</th></tr>
<tr><td><b>● متوفر 8</b></td><td>موجود الآن في مخزننا في بغداد، والرقم هو الكمية المتوفرة.</td></tr>
<tr><td><b>التوريد خلال 4–6 أسابيع</b></td><td>جهاز Supmea يُستورد حسب الطلب لمشروعك.</td></tr>
<tr><td><b>حسب الطلب · 1–3 أسابيع</b></td><td>قطعة غيار قديمة لأنظمة DCS / PLC / SIS من مخزون مستقل. تُذكر الحالة وتقرير الفحص وضمان IES في عرض السعر.</td></tr>
<tr><td><b>مستعمل / مخزون قديم، متوقف إنتاجه، قيد الإيقاف</b></td><td>حالة المادة، وحالة المنتج لدى الشركة المصنعة.</td></tr></table>
<p>الصور لتعريف المنتج، وقد تختلف المادة المجهزة في الإصدار أو الشكل. علامة «صورة تمثيلية» تعني أن الصورة لنفس عائلة المنتج.</p>''', None),
   ('add', 'إضافة المواد إلى الطلب', '''<ol><li>حدد الكمية بزرّي <b>−</b> و<b>+</b> على البطاقة.</li>
<li>اضغط الزر الأخضر <b>+</b>، فيتحول إلى <b>✓</b> ويزداد عدّاد الطلب على جانب الشاشة.</li>
<li>اضغط على رقم القطعة أو الصورة لرؤية التفاصيل: الشركة المصنعة وبلد المنشأ ورمز HS ودورة الحياة والبديل.</li></ol>''', 'add'),
   ('supmea', 'اختيار مواصفات جهاز Supmea', '''<ol><li>افتح <b>أجهزة القياس</b> واضغط <b>اختر المواصفات وأضف</b> على أحد موديلات Supmea.</li>
<li>اختر ما تعرفه: القطر أو المدى، والإشارة الخارجة، والتوصيل، والكمية. وأضف ملاحظات مثل المادة المقاسة أو الحرارة أو عدد الأجهزة.</li>
<li>اضغط <b>أضف إلى الطلب</b>. يؤكد مهندسو IES رمز الطلب النهائي ويرسلون ورقة المواصفات مع عرض السعر.</li></ol>
<p>رابط <b>ورقة المواصفات (PDF)</b> يفتح ورقة المواصفات من الشركة المصنعة.</p>''', 'supmea'),
   ('bom', 'لصق قائمة القطع (قطع الغيار القديمة)', '''<ol><li>افتح <b>القطاع الصناعي › قطع غيار قديمة</b>.</li>
<li>الصق قائمتك في المربع: رقم قطعة واحد في كل سطر، وبعده الكمية إن كنت تعرفها (مثلاً <code>3805E 2</code>).</li>
<li>اختر العلامة التجارية إذا كانت كل القطع من علامة واحدة (اختياري)، ثم اضغط <b>تحقق وأضف إلى الطلب</b>.</li></ol>
<p>يُفحص كل سطر: المواد الموجودة في مخزن IES تُطابق، والقطع المدرجة تُضاف، والباقي يُضاف للتوفير. كل الأسطر تدخل في طلب واحد.</p>''', 'bom'),
   ('send', 'إرسال طلب التسعير', '''<ol><li>اضغط <b>اطلب عرض سعر</b> (أو زر <b>RFQ</b> على جانب الشاشة)، فيفتح طلبك بكل البنود.</li>
<li>راجع الكميات، واحذف ما لا تحتاجه، وأضف ملاحظة لأي بند.</li>
<li>املأ <b>الشركة</b> و<b>اسم الشخص</b> و<b>الهاتف / واتساب</b> (إلزامية)، وإن أمكن: البريد الإلكتروني ومدينة التسليم ورقم المشروع أو أمر الشراء والتاريخ المطلوب ورسالة.</li>
<li>اضغط <b>أرسل طلب التسعير</b>. يظهر لك رقم الطلب (مثلاً <span dir="ltr">RFQ-261127-AB12</span>). وإذا كتبت بريدك الإلكتروني تصلك رسالة تأكيد.</li></ol>
<p>يمكنك أيضاً إرسال الطلب نفسه عبر <b>البريد الإلكتروني</b> أو <b>واتساب</b>، أو تنزيله كملف CSV لسجلاتك.</p>''', 'send'),
   ('after', 'بعد الإرسال', '''<ul><li>يراجع مهندس من IES الطلب ويرد عليك بالبريد أو واتساب خلال يوم عمل واحد، وعادةً مع عرض السعر.</li>
<li>اذكر رقم الطلب عند الاتصال بنا أو مراسلتنا.</li>
<li>يبقى طلبك محفوظاً في المتصفح حتى ترسله أو تفرغه، فتستطيع إضافة المواد على عدة زيارات.</li></ul>''', None),
   ('privacy', 'بياناتك وأسماء المنتجات', '''<ul><li>نستخدم بيانات الاتصال فقط للرد على طلبك وإعداد عرض السعر، ولا نبيعها ولا نشاركها.</li>
<li>أسماء العلامات التجارية وأرقام القطع لتعريف المنتجات فقط. تُجهَّز قطع الغيار القديمة من مخزون مستقل وليس كتوريد معتمد من الشركة المصنعة.</li></ul>''', None),
   ('contact', 'تواصل معنا', '''<p>شركة الخضراء للخدمات الهندسية المتكاملة (IES) · اليرموك، بغداد · شارع السعدي، البصرة<br>
البريد الإلكتروني <a href="mailto:info@ies-iraq.com" dir="ltr">info@ies-iraq.com</a> · السبت–الخميس 08:00–16:00</p>''', None),
  ])

ALT = {'search': ('Search box, quick chips and divisions', 'مربع البحث والاختيارات السريعة والقطاعات'),
       'filters': ('Filters on the left of the item list', 'الفلاتر بجانب قائمة المواد'),
       'add': ('Item card with quantity and add button', 'بطاقة المادة مع الكمية وزر الإضافة'),
       'supmea': ('Supmea configuration window', 'نافذة اختيار مواصفات Supmea'),
       'bom': ('Paste-your-list box and result', 'مربع لصق القائمة والنتيجة'),
       'send': ('RFQ panel with contact form', 'لوحة الطلب ونموذج بيانات الاتصال')}


def page(lang):
    t = EN if lang == 'en' else AR
    ar = lang == 'ar'
    up = '../../../' if ar else '../../'          # to repo root
    site = '../../' if ar else '../../'           # to language home
    path = 'ar/store/help/' if ar else 'store/help/'
    url = f'{base}/{path}'

    def L(h):
        if h == 'store/help/': return './'
        if h == 'store/': return '../'
        return site + h
    nav = ''.join(f'<a href="{L(h)}"' + (' aria-current="page"' if h == 'store/help/' else '') + f'>{n}</a>' for n, h in t['nav'])
    fnav = ''.join(f'<a href="{L(h)}">{n}</a>' for n, h in t['fnav'])
    toc = ''.join(f'<li><a href="#{i}">{ttl}</a></li>' for i, ttl, _, _ in t['secs'])
    body = ''
    for n, (i, ttl, h, pic) in enumerate(t['secs'], 1):
        fig = ''
        if pic and os.path.exists(os.path.join(repo, 'store/help/img', f'{pic}-{lang}.webp')):
            fig = f'<figure><img src="{up}store/help/img/{pic}-{lang}.webp" alt="{ALT[pic][1 if ar else 0]}" loading="lazy"></figure>'
        body += f'<section class="hp-sec" id="{i}"><h2><span class="hn">{n:02d}</span>{ttl}</h2><div class="hp-body">{h}{fig}</div><a class="hp-top" href="#top">↑ {t["top"]}</a></section>\n'
    robots = '<meta name="robots" content="noindex, nofollow">\n' if noindex else ''
    testbar = f'<div class="testbar">Test site · {rel} · {today}</div>' if status == 'Test' else ''
    return f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if ar else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="ies-site-id" content="{rel}">
<meta name="ies-site-release" content="{today}">
{robots}<meta name="ies-site-status" content="{status}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{base}/store/help/">
<link rel="alternate" hreflang="ar" href="{base}/ar/store/help/">
<title>{t['title']}</title>
<meta name="description" content="{t['desc']}">
<link rel="icon" href="{up}favicon.ico">
<link rel="icon" type="image/png" href="{up}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&amp;family=Inter:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400;500{'&amp;family=IBM+Plex+Sans+Arabic:wght@400;500;600;700' if ar else ''}&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}assets/css/style.css?v={V}">
<link rel="stylesheet" href="{up}store/assets/store.css?v={V}">
<link rel="stylesheet" href="{up}store/assets/help.css?v={V}">
</head>
<body id="top">
{testbar}
<a class="skip" href="#main">Skip to content</a>
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
<a class="btn btn-g" href="../">{t['cta']}</a>
</nav>
</div>
</header>
<main id="main">
<section class="st-hero dark hp-hero"><div class="wrap"><div class="live"><span class="dot"></span>{t['kicker']}</div><h1>{t['h1']}</h1><p class="lead">{t['lead']}</p></div></section>
<div class="wrap hp-wrap">
<nav class="hp-toc" aria-label="{t['toc']}"><b>{t['toc']}</b><ol>{toc}</ol><p class="hp-vid">{t['video']}</p></nav>
<div class="hp-main">
{body}</div>
</div>
</main>
<footer class="ftr">
<div class="wrap">
<span>{t['copy'].format(y='<span class="yr">2026</span>')}</span>
<nav aria-label="Footer">{fnav}<a href="{t['flang'][0]}" lang="{t['flang'][2]}">{t['flang'][1]}</a></nav>
</div>
</footer>
<script src="{up}assets/js/main.js?v={V}"></script>
</body>
</html>
'''


for lang, out in (('en', 'store/help/index.html'), ('ar', 'ar/store/help/index.html')):
    p = os.path.join(repo, out)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(page(lang))
    print('wrote', out)
