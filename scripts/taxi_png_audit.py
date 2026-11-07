import os
import sys
import csv
from PIL import Image

def analyze_png(filepath):
    try:
        im = Image.open(filepath)
    except Exception as e:
        return None
    
    w, h = im.size
    mode = im.mode
    
    if mode not in ("RGBA", "LA") and "transparency" not in im.info:
        # No alpha channel - entirely opaque
        return {
            "file": filepath,
            "width": w,
            "height": h,
            "has_alpha": False,
            "bbox_x": 0,
            "bbox_y": 0,
            "bbox_w": w,
            "bbox_h": h,
            "margin_left": 0,
            "margin_top": 0,
            "margin_right": 0,
            "margin_bottom": 0,
            "visible_pct": 100.0,
            "canvas_ar": round(w / h, 2),
            "content_ar": round(w / h, 2)
        }
    
    im_rgba = im.convert("RGBA")
    alpha = im_rgba.split()[-1]
    
    # Threshold alpha > 10 to ignore near-invisible fringe
    threshold = 10
    mask = alpha.point(lambda p: 255 if p > threshold else 0)
    bbox = mask.getbbox()  # (left, top, right, bottom)
    
    if not bbox:
        return {
            "file": filepath,
            "width": w,
            "height": h,
            "has_alpha": True,
            "bbox_x": 0, "bbox_y": 0, "bbox_w": 0, "bbox_h": 0,
            "margin_left": w, "margin_top": h, "margin_right": 0, "margin_bottom": 0,
            "visible_pct": 0.0,
            "canvas_ar": round(w / h, 2),
            "content_ar": 0.0
        }
    
    bx1, by1, bx2, by2 = bbox
    bw = bx2 - bx1
    bh = by2 - by1
    
    # Visible pixels count
    hist = mask.histogram()
    opaque_pixels = hist[255]
    visible_pct = round((opaque_pixels / (w * h)) * 100, 1)
    
    return {
        "file": filepath,
        "width": w,
        "height": h,
        "has_alpha": True,
        "bbox_x": bx1,
        "bbox_y": by1,
        "bbox_w": bw,
        "bbox_h": bh,
        "margin_left": bx1,
        "margin_top": by1,
        "margin_right": w - bx2,
        "margin_bottom": h - by2,
        "visible_pct": visible_pct,
        "canvas_ar": round(w / h, 2),
        "content_ar": round(bw / bh, 2) if bh > 0 else 0
    }

def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "public/Gui/TaxiGui"
    out_csv = sys.argv[2] if len(sys.argv) > 2 else "dist/Gui/TaxiGui/new/sprite_audit.csv"
    
    results = []
    for root, dirs, files in os.walk(target_dir):
        for f in sorted(files):
            if f.lower().endswith(".png"):
                p = os.path.join(root, f)
                data = analyze_png(p)
                if data:
                    rel = os.path.relpath(p, target_dir)
                    data["relative_path"] = rel
                    results.append(data)

    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "relative_path", "width", "height", "has_alpha",
            "bbox_x", "bbox_y", "bbox_w", "bbox_h",
            "margin_left", "margin_top", "margin_right", "margin_bottom",
            "visible_pct", "canvas_ar", "content_ar"
        ], extrasaction="ignore")
        writer.writeheader()
        writer.writerows(results)

    print(f"Audited {len(results)} sprites, saved to {out_csv}")
    for r in results:
        rel = r["relative_path"]
        w, h = r["width"], r["height"]
        bw, bh = r["bbox_w"], r["bbox_h"]
        bx, by = r["bbox_x"], r["bbox_y"]
        car = r["canvas_ar"]
        ctar = r["content_ar"]
        if any(k in rel for k in ["car_", "building", "gear", "tab_", "icon_stat", "btn_"]):
            print(f"{rel:40} | Canvas: {w}x{h} | Content: {bw}x{bh} at ({bx},{by}) | AR: {car} -> {ctar}")

if __name__ == "__main__":
    main()
