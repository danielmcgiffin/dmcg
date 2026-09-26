"""Check the SVG layer contract after a manual Inkscape edit (stdlib only)."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

source = Path(__file__).resolve().parents[1] / "src/assets/office.svg"
root = ET.parse(source).getroot()
elements = [element for element in root.iter() if element.get("id")]
ids = {element.get("id"): element for element in elements}
assert len(ids) == len(elements), "Duplicate object IDs: give duplicated groups unique IDs."
assert root.get("viewBox") == "0 0 1700 960", "Keep the original page coordinates."

for name in ("roof", "environmental-details", "editing-guides"):
    assert name in ids, f"Missing layer: {name}"
for number in ("01", "02", "03"):
    floor_id = f"floor-{number}"
    assert floor_id in ids, f"Missing layer: {floor_id}"
    children = {child.get("id") for child in ids[floor_id].iter()}
    for name in (f"exterior-walls-floor-{number}", f"{floor_id}-plate", f"{floor_id}-additions"):
        assert name in children, f"{name} must stay inside {floor_id}."
roof_children = {child.get("id") for child in ids["roof"].iter()}
for name in ("roof-cafe", "roof-solar", "roof-access", "roof-surface", "roof-additions"):
    assert name in roof_children, f"{name} must stay inside roof."
for element in root.iter():
    assert element.tag.rsplit("}", 1)[-1] not in ("script", "foreignObject"), "Unexpected executable SVG content."
    for name, value in element.attrib.items():
        assert not name.lower().startswith("on"), "Unexpected SVG event handler."
        if name.rsplit("}", 1)[-1] == "href":
            assert value.startswith("#"), "Embed editable vectors rather than linking external images."
            assert value[1:] in ids, f"Broken object reference: {value}"
        for reference in re.findall(r"url\(#([^\)]+)\)", value):
            assert reference in ids, f"Missing clip, mask or paint definition: {reference}"
print(f"Office SVG: valid XML, {len(ids)} unique IDs, animation layers and ownership intact.")
