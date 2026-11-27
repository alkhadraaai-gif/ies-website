#!/usr/bin/env python3
"""IES Store – offline backup and record copy.

Usage:
  backup_store.py <repo> <out_dir> <release_label> [YYYY-MM-DD]

Makes, in <out_dir>:
  IES_Store_Backup_<release>_<date>.zip      – every store file (EN + AR pages, app, data, pictures, admin,
                                               API, build tools) as they are in <repo>; use it to roll back.
  IES_Store_Catalogue_<release>_<date>.xlsx  – the published catalogue (store/data/catalog.json) as an Excel
                                               record: Catalogue, Summary and Info sheets, IES palette.
The RFQ data on the live server is NOT in this backup: download it from al-khadraa.com/store/admin/
(Backup & restore › Download), because it only exists on GoDaddy.
"""
import sys, os, json, zipfile, datetime, collections
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment

INCLUDE = ['store', 'ar/store', 'tools', 'version.json']
EXCLUDE_PARTS = ('/api/data/RFQ-', '/api/data/status.json', '/api/data/audit.log', '/api/data/backups/',
                 '/api/data/uploads/', '/api/data/admin_config.php', '/api/data/th_', '/api/data/rl_', '__pycache__')

SRC = {'stock': 'In stock (Baghdad)', 'supmea': 'Supmea – import to order (4–6 weeks)', 'spare': 'Legacy spare – on request (1–3 weeks)'}
SEC = {'ind:ctl': 'Industrial › Control Systems', 'ind:ins': 'Industrial › Instruments', 'ind:spr': 'Industrial › Legacy Spares',
       'bld:bms': 'Building › BMS', 'bld:knx': 'Building › KNX', 'bld:fire': 'Building › Fire Alarm', 'bld:ins': 'Building › Instruments'}
COND = {'new': 'New', 'used': 'Used / old stock', 'nos': 'New old stock', 'ref': 'Refurbished', 'new_surplus': 'New surplus'}
LIFE = {'active': 'Active', 'phase': 'Phase-out', 'disc': 'Discontinued', 'tbc': 'To be confirmed'}


def zip_store(repo, path):
    n = 0
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for top in INCLUDE:
            full = os.path.join(repo, top)
            files = [full] if os.path.isfile(full) else [os.path.join(dp, f) for dp, _, fs in os.walk(full) for f in fs]
            for f in sorted(files):
                rel = os.path.relpath(f, repo).replace(os.sep, '/')
                if any(x in '/' + rel for x in EXCLUDE_PARTS):
                    continue
                z.write(f, rel)
                n += 1
    return n


def catalogue_xlsx(repo, path, release, date):
    d = json.load(open(os.path.join(repo, 'store/data/catalog.json'), encoding='utf-8'))
    items = d['items']
    wb = Workbook()
    hdr_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    hdr_fill = PatternFill('solid', fgColor='4F81BD')
    alt = PatternFill('solid', fgColor='DBE5F1')
    side = Side(style='thin', color='95B3D7')
    border = Border(left=side, right=side, top=side, bottom=side)
    body = Font(name='Calibri', size=11)

    def sheet(ws, rows, widths):
        for r, row in enumerate(rows, 1):
            for c, v in enumerate(row, 1):
                cell = ws.cell(r, c, v)
                cell.border = border
                cell.font = hdr_font if r == 1 else body
                cell.alignment = Alignment(vertical='top', wrap_text=True)
                if r == 1:
                    cell.fill = hdr_fill
                elif r % 2 == 0:
                    cell.fill = alt
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[ws.cell(1, i).column_letter].width = w
        ws.freeze_panes = 'A2'
        if len(rows) > 1:
            ws.auto_filter.ref = ws.dimensions

    ws = wb.active
    ws.title = 'Catalogue'
    rows = [['Key', 'Source / availability', 'Store sections', 'Warehouse code', 'Part number / model', 'Description', 'Manufacturer',
             'Product type', 'Condition', 'Lifecycle', 'Qty in stock', 'UoM', 'Lead time', 'Country of origin', 'HS code', 'Successor', 'Picture']]
    for i in items:
        rows.append([i.get('k', ''), SRC.get(i.get('src'), i.get('src', '')), ', '.join(SEC.get(s, s) for s in i.get('sec', [])),
                     i.get('id', ''), i.get('pn', ''), i.get('d', ''), i.get('mfr', ''), i.get('t', ''),
                     COND.get(i.get('cond'), i.get('cond', '')), LIFE.get(i.get('life'), i.get('life', '')),
                     i.get('qty') if i.get('src') == 'stock' else '', i.get('uom', ''), (i.get('lead', '') + ' weeks') if i.get('lead') else '', i.get('coo', ''), i.get('hs', ''),
                     i.get('succ', ''), ('representative' if i.get('rep') else 'yes') if i.get('img') else 'placeholder'])
    sheet(ws, rows, [16, 24, 30, 14, 26, 60, 16, 12, 18, 14, 10, 8, 14, 14, 12, 18, 14])

    ws2 = wb.create_sheet('Summary')
    cnt = collections.Counter()
    for i in items:
        for s in i.get('sec', []):
            cnt[(SEC.get(s, s), SRC.get(i.get('src'), ''))] += 1
    srows = [['Store section', 'Source / availability', 'Items']] + [[a, b, n] for (a, b), n in sorted(cnt.items())]
    srows.append(['TOTAL (unique items)', '', len(items)])
    sheet(ws2, srows, [36, 30, 10])
    last = ws2.max_row
    for c in range(1, 4):
        ws2.cell(last, c).fill = PatternFill(fill_type=None)
        ws2.cell(last, c).font = Font(name='Calibri', size=11, bold=True)
        ws2.cell(last, c).border = Border(top=Side(style='double', color='4F81BD'))

    ws3 = wb.create_sheet('Info')
    sheet(ws3, [['Item', 'Value'], ['Document', 'IES Store – published catalogue (record copy)'], ['Release', release],
                ['Date', date], ['Catalogue generated', d.get('generated', '')], ['Warehouse source', d.get('source', '')],
                ['Items', len(items)], ['Note', 'Public catalogue only. Cost, sell price, supplier, import reference, location and internal notes are never in the store.'],
                ['Company', 'AL-KHADRAA INTEGRATED ENGINEERING SERVICES (IES)']], [22, 90])
    wb.save(path)
    return len(items)


if __name__ == '__main__':
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    repo, out, rel = sys.argv[1], sys.argv[2], sys.argv[3]
    date = sys.argv[4] if len(sys.argv) > 4 else datetime.date.today().isoformat()
    os.makedirs(out, exist_ok=True)
    z = os.path.join(out, f'IES_Store_Backup_{rel}_{date}.zip')
    x = os.path.join(out, f'IES_Store_Catalogue_{rel}_{date}.xlsx')
    print('files in backup:', zip_store(repo, z), '→', z)
    print('catalogue items:', catalogue_xlsx(repo, x, rel, date), '→', x)
