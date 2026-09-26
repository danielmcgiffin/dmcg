/** Stable IDs in src/assets/office.svg. Inkscape labels can be renamed freely. */
export const officeLayers = [
  { id: 'all', label: 'Whole building' },
  { id: 'roof', label: 'Roof · café, stairs and solar' },
  { id: 'floor-03', label: '03 · Control' },
  { id: 'floor-02', label: '02 · Fulfillment' },
  { id: 'floor-01', label: '01 · Demand' },
  { id: 'environmental-details', label: 'Site · trees and people' },
] as const

export type OfficeLayer = typeof officeLayers[number]['id']

/** Animate a runtime wrapper, preserving transforms saved by Inkscape. */
export function motionLayer(svg: SVGSVGElement, id: string): SVGGElement | null {
  const existing = svg.querySelector<SVGGElement>(`[data-motion="${id}"]`)
  if (existing) return existing
  const artwork = svg.querySelector<SVGGElement>(`[id="${id}"]`)
  if (!artwork) return null
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  wrapper.dataset.motion = id
  artwork.before(wrapper)
  wrapper.append(artwork)
  return wrapper
}
