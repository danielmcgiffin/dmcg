# Editing the office drawing

**Edit `src/assets/office.svg`.** It is the live source, not a generated export.
Run `npm run art:edit` to open it in Inkscape, then save normally with Ctrl+S.
Run `npm run dev` and open `/?edit=office` on the printed local address for a
preview with a reveal slider and layer isolation. The editing view is available
only in development. Saving the SVG refreshes it through Vite.

The supplied `~/Downloads/office.svg` remains untouched. That file contains
254 colour paths spread across the whole image (about 155 MB), rather than
separate objects. The working file is a simpler vector interpretation of its
layout and palette. `design/office-reference.png` records the supplied appearance.
It is not a pixel-identical conversion.

## Move a tree or table

1. In Inkscape, open **Layers and Objects** with Ctrl+Shift+L.
2. Expand **00 · Site** and select `site-tree-01`, or expand **04 · Roof → Cafe
   terrace** and select `cafe-table-01`. Click the eye beside a group to identify it.
3. Select the entire object group. Drag or use arrow keys to nudge it. A tree group
   includes its trunk, foliage, tree grate, and shadow.
4. Save and inspect the browser. Use the preview's **Inspect** selector to see
   only the roof, one floor, or the site.

On a floor, the two ground directions run diagonally: approximately 10 pixels
right and 5.6 down, or 10 pixels left and 5.6 down. Those are the illustration's
isometric axes. Keep furniture feet on the same plane when moving it.

## Add an object

Duplicate a matching group with Ctrl+D, then move the duplicate. Inkscape gives
it a new ID; give it a descriptive label in the Objects panel. Keep it inside
the layer that should carry it during animation. Each floor and the roof has
an **Add new objects here** layer. Ordinary editing is done in the SVG, with no
JavaScript changes or rebuild/export command needed.

| Layer ID | Contents and animation |
| --- | --- |
| `environmental-details` | Site, trees, pedestrians; fades during reveal |
| `floor-01` | Demand; ground floor → right |
| `floor-02` | Fulfillment; middle floor → left |
| `floor-03` | Control; top floor → top |
| `exterior-walls-floor-01` (and 02/03) | Facades inside their floor; fade out |
| `roof` | Entire roof, café, panels, stairs and planting; lifts and fades |
| `editing-guides` | Hidden route guide; never displayed on the public page |

Keep these IDs and the page's `viewBox`. Labels can be renamed. The app creates
temporary animation wrappers, so it does not overwrite the transforms you save
on your artwork. Keep each floor's furniture and people inside that floor.

## Edit the café-to-roof stair

Isolate **Roof** in the browser and enable the route guide. In Inkscape, show the
**GUIDES · Walking route** layer with its eye icon; hide it again when finished.
It is locked so it cannot be selected accidentally.

The working layout has a café door facing the terrace, a clear route across the
back of the terrace, and a landing at the head of the stair. The solar array
is on the other side of the opening. This is a spatial illustration without a
physical scale, not a construction drawing.

The access assembly has three related pieces:

- **Roof → Access stair → Opening footprint · show to edit**: show this layer's
  eye icon and select `roof-stair-footprint`, the black master shape. Use the
  Node tool to change it, then hide the layer again. The web preview always hides
  this editing shape while using its geometry for the opening.
- **Roof → Access stair**: stairwell, treads, landing, and guardrail. The rail
  leaves the landing end open for entry. Steps descend toward the floor below.
- The deck mask and stair clip both reference that footprint. Changing its nodes
  updates the deck cutout, plank interruptions, and stair clipping together.

For small changes, adjust the landing or rails as grouped objects. To resize the
opening, edit the **Opening footprint** and then fit the landing, steps, and
guardrail to it. Keep the outer Access stair group in place: the linked cutout
uses the footprint's own coordinates, so moving only its parent group will not
move the cutout. Duplicate ordinary furniture freely; for a second stair opening,
add another footprint to the mask and give the new stair its own matching clip.
Keep the route from the door and the landing free of tables, plants, and panels.

## Check after editing

Run `npm run art:check` (requires Python 3) to check XML, duplicate IDs and layer
ownership. Then run `npm run build`. Inspect both closed and open states in the
editing view. The original drawing and earlier hero SVG are retained separately.
