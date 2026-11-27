#!/usr/bin/env python3
"""Build store/data/catalog.json for the IES Store.

Usage: build_store_catalog.py <warehouse_register_or_export.xlsx> <out.json> [publish.xlsx]

Publish rule (only these warehouse items go to the store):
  * if a publish sheet/column "Store" exists (Yes/No) -> it decides;
  * otherwise default: Available > 0, Verify? = No, description known.
Only public fields are exported: never cost, sell price, supplier, import ref,
location or internal notes.
"""
import sys, json, re, datetime, openpyxl

src, out = sys.argv[1], sys.argv[2]
pub_file = sys.argv[3] if len(sys.argv) > 3 else None

wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
ws = wb["Item_Master"] if "Item_Master" in wb.sheetnames else wb.worksheets[0]
rows = list(ws.iter_rows(values_only=True))
hdr = [str(h).strip() if h else "" for h in rows[0]]
items = [dict(zip(hdr, r)) for r in rows[1:] if r and r[0]]

flags = {}
if pub_file:
    pw = openpyxl.load_workbook(pub_file, read_only=True, data_only=True).worksheets[0]
    pr = list(pw.iter_rows(values_only=True))
    ph = [str(h).strip() if h else "" for h in pr[0]]
    ci, cs = ph.index("Item Code"), ph.index("Store")
    for r in pr[1:]:
        if r and r[ci]:
            flags[str(r[ci]).strip()] = str(r[cs] or "").strip().lower() in ("yes", "y", "1", "true")

def g(i, *keys):
    for k in keys:
        if k in i and i[k] not in (None, ""):
            return i[k]
    return None

CAT = {"PLC": "plc", "Remote I/O": "rio", "HMI": "hmi", "Power Supply": "psu",
       "Network / Comms": "net", "Process Instrumentation": "inst", "Fire": "fire",
       "BMS": "bms", "KNX": "knx", "LV Controls": "lv", "Accessories": "acc", "Other": "oth"}

stock = []
for i in items:
    code = str(i.get("Item Code")).strip()
    desc = g(i, "Description") or ""
    avail = g(i, "Available", "On Hand") or 0
    try:
        avail = int(avail)
    except Exception:
        avail = 0
    if code in flags:
        ok = flags[code]
    elif "Store" in i:
        ok = str(i.get("Store") or "").strip().lower() in ("yes", "y")
    else:
        ok = avail > 0 and str(g(i, "Verify?") or "").lower() == "no" and not desc.upper().startswith("TBC")
    if not ok:
        continue
    notes = str(g(i, "Notes") or "")
    m = re.search(r"successor\s+([0-9A-Z][0-9A-Z.\-/ ]{4,}?)(?:;|$)", notes, re.I)
    stock.append({
        "id": code,
        "pn": str(g(i, "P/N (Order No.)", "P/N") or "").strip(),
        "d": desc,
        "mfr": g(i, "Manufacturer") or "",
        "cat": CAT.get(g(i, "Category") or "Other", "oth"),
        "cond": "new" if str(g(i, "Condition") or "").lower().startswith("new") else
                ("ref" if "refurb" in str(g(i, "Condition") or "").lower() else "used"),
        "coo": g(i, "COO") or "",
        "hs": str(g(i, "HS Code") or ""),
        "life": {"Active": "active", "Phase-out": "phase", "Discontinued": "disc"}.get(g(i, "Lifecycle") or "", "tbc"),
        "qty": max(avail, 0),
        "uom": g(i, "UoM") or "pcs",
        "succ": m.group(1).strip() if m else "",
    })

data = json.load(open(out)) if False else {}
data = {
    "generated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
    "source": src.split("/")[-1],
    "stock": sorted(stock, key=lambda x: (x["cat"], x["pn"])),
}
supmea = json.load(open(__file__.rsplit("/", 1)[0] + "/store_supmea.json", encoding="utf-8"))
data.update(supmea)
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"stock items published: {len(stock)} of {len(items)}; supmea models: {len(supmea['supmea'])}")
