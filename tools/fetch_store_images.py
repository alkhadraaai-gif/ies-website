#!/usr/bin/env python3
"""Download product pictures for the IES Store and normalise them (square, white, 400 px WebP).

Inputs (collected once, kept under tools/):
  store_image_sources.json  {item_key: source_url}
Output:
  store/img/<slug>.webp and tools/store_images.json {item_key: "img/<slug>.webp"}
"""
import json, os, re, io, hashlib, subprocess, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC = json.load(open(os.path.join(HERE, "store_image_sources.json"), encoding="utf-8"))
OUTDIR = os.path.join(REPO, "store", "img")
os.makedirs(OUTDIR, exist_ok=True)
done = {}
cache = {}
for key, url in SRC.items():
    if not url:
        continue
    slug = re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-")[:60] + "-" + hashlib.sha1(url.encode()).hexdigest()[:6]
    path = os.path.join(OUTDIR, slug + ".webp")
    if url in cache:
        done[key] = cache[url]; continue
    if not os.path.exists(path):
        raw = subprocess.run(["curl", "-sL", "-m", "40", url], capture_output=True).stdout
        try:
            im = Image.open(io.BytesIO(raw)).convert("RGBA")
        except Exception:
            print("skip", key, url, file=sys.stderr); continue
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im); im = bg.convert("RGB")
        # trim white margins, then pad to square
        gray = im.convert("L").point(lambda p: 255 if p < 246 else 0)
        box = gray.getbbox()
        if box: im = im.crop(box)
        side = int(max(im.size) * 1.08)
        sq = Image.new("RGB", (side, side), (255, 255, 255)); sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
        sq.thumbnail((400, 400), Image.LANCZOS)
        sq.save(path, "WEBP", quality=80, method=6)
    done[key] = cache[url] = "img/" + slug + ".webp"
json.dump(done, open(os.path.join(HERE, "store_images.json"), "w", encoding="utf-8"), indent=0, ensure_ascii=False)
print("images:", len(done), "of", len(SRC))
