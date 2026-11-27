#!/usr/bin/env python3
"""Make the pictures for the store Help pages (store/help/img/<name>-<lang>.webp) from a locally served copy.
Usage: help_shots.py <repo> <local_base_url e.g. http://127.0.0.1:8090>"""
import sys, os, asyncio, io
from PIL import Image
from playwright.async_api import async_playwright

repo, BASE = sys.argv[1], sys.argv[2].rstrip('/')
OUT = os.path.join(repo, 'store/help/img')
os.makedirs(OUT, exist_ok=True)


def save(png, name, lang, width=1100):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if im.width > width:
        im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, f'{name}-{lang}.webp'), 'WEBP', quality=82, method=6)


async def run(lang):
    url = BASE + ('/ar/store/' if lang == 'ar' else '/store/')
    async with async_playwright() as p:
        b = await p.chromium.launch()
        c = await b.new_context(viewport={'width': 1280, 'height': 820}, device_scale_factor=1.5)
        pg = await c.new_page()
        await pg.goto(url)
        await pg.wait_for_selector('#grid .card, #grid article', timeout=15000)
        await pg.add_style_tag(content='.testbar{display:none!important}.hdr{position:static!important}.srcbar{position:static!important}')
        await pg.wait_for_timeout(800)
        # 1 search: hero + division buttons
        hero = await pg.query_selector('.st-hero')
        bb = await hero.bounding_box()
        divs = await pg.query_selector('.divs')
        db = await divs.bounding_box() if divs else bb
        await pg.fill('#q', '6ES7')
        await pg.wait_for_timeout(600)
        save(await pg.screenshot(clip={'x': 0, 'y': bb['y'], 'width': 1280, 'height': db['y'] + db['height'] - bb['y'] + 16}), 'search', lang)
        await pg.fill('#q', '')
        await pg.wait_for_timeout(400)
        # 2 filters: catalogue top
        cat = await pg.query_selector('#catalog')
        await cat.scroll_into_view_if_needed()
        cb = await cat.bounding_box()
        sy = await pg.evaluate('window.scrollY')
        save(await pg.screenshot(clip={'x': 0, 'y': cb['y'] + sy, 'width': 1280, 'height': 640}, full_page=True), 'filters', lang)
        # 3 add: press + on the first two cards
        adds = await pg.query_selector_all('#grid [data-add].add')
        for a in adds[:2]:
            await a.click()
            await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(1800)  # let the toast go
        g = await pg.query_selector('#grid')
        await g.scroll_into_view_if_needed()
        gb = await g.bounding_box()
        sy = await pg.evaluate('window.scrollY')
        save(await pg.screenshot(clip={'x': gb['x'] - 10, 'y': gb['y'] + sy - 10, 'width': min(gb['width'] + 20, 1280 - gb['x'] + 10), 'height': 600}, full_page=True), 'add', lang, 1000)
        # 4 supmea configurator
        await pg.click('[data-sec="ind:ins"]')
        await pg.wait_for_timeout(500)
        await pg.set_viewport_size({'width': 1280, 'height': 1100})
        await pg.click('#grid button.add.wide')
        await pg.wait_for_selector('.modal .box form', timeout=5000)
        await pg.wait_for_timeout(500)
        sels = await pg.query_selector_all('.modal select')
        for s in sels:
            opts = await s.eval_on_selector_all('option', 'o => o.map(x => x.textContent)')
            if len(opts) > 1:
                await s.select_option(index=1)
        ins = await pg.query_selector('.modal input:not([type=number])')
        if ins:
            await ins.fill('DN100')
        box = await pg.query_selector('.modal .box')
        save(await box.screenshot(), 'supmea', lang, 900)
        await pg.keyboard.press('Escape')
        await pg.set_viewport_size({'width': 1280, 'height': 820})
        await pg.wait_for_timeout(400)
        # 5 bom: legacy spares
        await pg.click('[data-sec="ind:spr"]')
        await pg.wait_for_timeout(500)
        await pg.fill('#bom', '3805E 2\n6ES7350-1AH03-0AE0 1\nIC697CPU780\n1756-IF16 4')
        await pg.click('#bomBtn')
        await pg.wait_for_timeout(1500)
        panel = await pg.query_selector('#bomPanel')
        save(await panel.screenshot(), 'bom', lang, 1000)
        # 6 send: RFQ drawer with form
        await pg.set_viewport_size({'width': 1280, 'height': 1250})
        await pg.click('[data-cart]')
        await pg.wait_for_timeout(700)
        for n, v in (('company', 'Basra Oil Company' if lang == 'en' else 'شركة نفط البصرة'), ('name', 'Ahmed Kareem' if lang == 'en' else 'أحمد كريم'), ('phone', '+964 780 000 0000'), ('city', 'Basra' if lang == 'en' else 'البصرة')):
            el = await pg.query_selector(f'#cartForm [name="{n}"]')
            if el:
                await el.fill(v)
        dr = await pg.query_selector('.drawer')
        save(await dr.screenshot(), 'send', lang, 700)
        # leave the RFQ empty for the next visitor of this profile
        await pg.evaluate('localStorage.clear()')
        await b.close()


for lg in ('en', 'ar'):
    asyncio.run(run(lg))
    print('pictures done', lg)
