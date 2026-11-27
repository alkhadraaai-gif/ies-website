#!/usr/bin/env python3
"""Build store/data/catalog.json for the IES Store (R7.1: Industrial / Building divisions).

Usage: build_store_catalog.py <warehouse_register.xlsx> <out.json> [Store_Publish.xlsx]

Publish rule for warehouse items: the "Store" column (Yes/No) of the publish sheet if given,
otherwise Available > 0, Verify? = No and description known. Only public fields are exported
(never cost, sell price, supplier, import ref, location or internal notes).
Images: tools/store_images.json maps item key -> local file under store/img/ (made by
fetch_store_images.py). Items without an image fall back to a category icon.
"""
import sys, json, re, os, datetime, openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
pub_file = sys.argv[3] if len(sys.argv) > 3 else None

def load_items(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb["Item_Master"] if "Item_Master" in wb.sheetnames else wb.worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    hdr = [str(h).strip() if h else "" for h in rows[0]]
    return [dict(zip(hdr, r)) for r in rows[1:] if r and r[0]]

items = load_items(src)
flags = {}
if pub_file:
    for r in load_items(pub_file):
        flags[str(r.get("Item Code")).strip()] = str(r.get("Store") or "").strip().lower() in ("yes", "y", "1", "true")

def g(i, *keys):
    for k in keys:
        if i.get(k) not in (None, ""):
            return i[k]
    return None

CAT = {"PLC": "plc", "Remote I/O": "rio", "HMI": "hmi", "Power Supply": "psu", "Network / Comms": "net",
       "Process Instrumentation": "inst", "Fire": "fire", "BMS": "bms", "KNX": "knx", "LV Controls": "lv",
       "Accessories": "acc", "Other": "oth"}
BLD_SENSORS = re.compile(r"^(QF|QV|QA|QB|QP|QX|AQF|QAE|QAA|QAM)", re.I)
imgs = json.load(open(os.path.join(HERE, "store_images.json"), encoding="utf-8")) if os.path.exists(os.path.join(HERE, "store_images.json")) else {}

out_items = []
# ---- warehouse stock ----
for i in items:
    code = str(i.get("Item Code")).strip()
    desc = g(i, "Description") or ""
    try:
        avail = int(g(i, "Available", "On Hand") or 0)
    except Exception:
        avail = 0
    ok = flags[code] if code in flags else (avail > 0 and str(g(i, "Verify?") or "").lower() == "no" and not desc.upper().startswith("TBC"))
    if not ok:
        continue
    pn = str(g(i, "P/N (Order No.)", "P/N") or "").strip()
    cat = CAT.get(g(i, "Category") or "Other", "oth")
    if cat == "fire": sec = ["bld:fire"]
    elif cat == "knx": sec = ["bld:knx"]
    elif cat == "bms": sec = ["bld:ins"] if BLD_SENSORS.match(pn) else ["bld:bms"]
    elif cat == "inst": sec = ["ind:ins"]
    else: sec = ["ind:ctl"]
    notes = str(g(i, "Notes") or "")
    m = re.search(r"successor\s+([0-9A-Z][0-9A-Z.\-/ ]{4,}?)(?:;|$)", notes, re.I)
    cond = str(g(i, "Condition") or "").lower()
    k = "S:" + code
    out_items.append({
        "k": k, "src": "stock", "sec": sec, "id": code, "pn": pn, "d": desc, "mfr": g(i, "Manufacturer") or "",
        "t": cat, "cond": "new" if cond.startswith("new") else ("ref" if "refurb" in cond else "used"),
        "coo": g(i, "COO") or "", "hs": str(g(i, "HS Code") or ""),
        "life": {"Active": "active", "Phase-out": "phase", "Discontinued": "disc"}.get(g(i, "Lifecycle") or "", "tbc"),
        "qty": max(avail, 0), "uom": g(i, "UoM") or "pcs", "succ": m.group(1).strip() if m else "", "img": imgs.get(k, "")})

# ---- Supmea + spares ----
sup = json.load(open(os.path.join(HERE, "store_supmea.json"), encoding="utf-8"))
BLD_SUP = {"SUP-LDGR", "SUP-FSC400", "SUP-TBY100", "SUP-P300", "SUP-PX300", "SUP-WZPK", "SUP-WSR201", "SUP-1158S", "SUP-ZP", "SUP-ST500", "SUP-MP"}
for m in sup["supmea"]:
    k = "P:" + m["m"]
    sec = ["ind:ins"] + (["bld:ins"] if m["m"] in BLD_SUP else [])
    x = {"k": k, "src": "supmea", "sec": sec, "pn": m["m"], "d": m["n"], "mfr": "Supmea", "t": m["fam"], "s": m["s"],
         "opt": m["opt"], "lead": m["lead"], "img": imgs.get(k, "")}
    for f in ("ds", "eval"):
        if m.get(f): x[f] = m[f]
    out_items.append(x)
for s in sup["spares"]:
    k = "R:" + s["b"] + ":" + s["pn"]
    out_items.append({"k": k, "src": "spare", "sec": ["ind:spr"], "pn": s["pn"], "d": s["d"], "mfr": s["b"], "t": s["c"], "img": imgs.get(k, "")})

data = {"generated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), "source": os.path.basename(src), "items": out_items}
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
c = Counter(s for it in out_items for s in it["sec"])
print("items:", len(out_items), dict(c), "with image:", sum(1 for it in out_items if it["img"]))
