# Krita Python Script to build the layered project
# Run via: Tools -> Scripts -> Scripter (or Tools -> Scripts -> Import Python Plugin)
import os
from krita import Krita

doc_w, doc_h = 240, 158
app = Krita.instance()
doc = app.createDocument(doc_w, doc_h, "Stone Wall Corner (500032)", "RGBA", "U8", "", 100.0)
app.activeWindow().addView(doc)

root = doc.rootNode()
layers_dir = "/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/public/buildings/Дороги/Каменная стена/corner_project/layers"

layer_files = [
    ("01_geometric_template_wireframe.png", "01 Geometric Template"),
    ("02_stone_masonry_base.png", "02 Stone Masonry"),
    ("03_coping_and_corner_quoins.png", "03 Coping & Quoins"),
    ("04_floral_and_foliage.png", "04 Flowers & Foliage"),
    ("05_decorative_medallion.png", "05 Medallion Details"),
    ("06_final_corner_composite.png", "06 Final Composite")
]

# Add each layer from file
for filename, layer_name in layer_files:
    path = os.path.join(layers_dir, filename)
    if os.path.exists(path):
        layer = doc.createFileLayer(layer_name, path, "None")
        root.addChildNode(layer, None)

save_path = "/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/public/buildings/Дороги/Каменная стена/corner_project/corner_wall_project.kra"
doc.saveAs(save_path)
print(f"Krita layered project saved successfully to {save_path}")
