OFFICE — LAYERED SOURCE CUTOUTS

Open office-layered-source.ora in GIMP using File > Open (not Open as Layers).
Save as office-layered-source.xcf to make a native GIMP working project.

94 visible raster layers, nested in named groups, plus one hidden
uncut original for comparison. Original size: 1024 x 558 pixels. No upscaling.
The complete visible stack reconstructs the upload exactly, pixel for pixel.
No generated redraw, automatic vector trace, or flattened duplicate underneath.

GROUPS
01 Trees: six trees, each with canopy, trunk and grate layers.
02 Outdoor activity: people, cafe furniture, cyclist and parked bicycles.
03 Roof: roof deck, fascia, railings, pavilion, solar array, patio, plants,
   furniture and people. Move the full Roof group to move the roof assembly.
04 Building: each of three floors, left/right facades, timber framing and
   visible floor edges; stone portals, windows and entrance canopies.
05 Landscape: attached planters and foundation shrubs.
06 Plaza: pavement, site edge, remaining ground shadows.
07 Background: visible parchment with cutouts where objects were extracted.
08 Original reference: hidden full image; keep hidden while editing cutouts.

IMPORTANT LIMITS
This is a layered conversion of a flattened image, not recovered native source.
The artwork contains no pixels for concealed surfaces. Moving or hiding a layer
therefore exposes transparency where the layer originally covered another part.
Use Clone/Heal/Paint on new layers to build the required hidden surfaces.
The facade windows keep the visible furniture and people seen through them;
glass, reflection and interior pixels cannot be separated losslessly from this
single flattened view. Floor-edge layers contain visible edges, not full plates.
Very small figures and foliage may need edge cleanup if moved or enlarged.
Bicycle/seat scene selections retain some small background areas in gaps.
Tree shadows remain mostly with the plaza and are not regenerated when moved.

MOVE A WHOLE COMPONENT
Select its group in the Layers panel, select Move, and choose Move the selected
layer in Tool Options. Do not use pick-a-layer if you mean to move the group.

FOR WEB EXPORT
Hide other groups and export the desired component as PNG with transparency.
Keep the full canvas size for easy shared alignment, or retain the original
x/y offsets when cropping. layer-map.json in this ORA archive records offsets.

The ORA is a ZIP container with source PNGs in data/ and a standard stack.xml.
