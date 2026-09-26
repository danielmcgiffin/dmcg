/** Add only approved, real work and writing. Empty collections are never rendered. */
export type Work = {
  slug: string
  title: string
  context: string
  image: { src: string; alt: string; width: number; height: number }
  video?: { src: string; type: string; captions: string }
  specifications: { label: string; value: string }[]
  outcome?: string
  href?: string
}

export type FieldNote = {
  title: string
  topic: string
  href: string
}

export const work: Work[] = []
export const fieldNotes: FieldNote[] = []
export const bookingUrl = 'https://cal.com/dannymcgiffin/30min'
export const followUrl = 'https://www.linkedin.com/in/danny-mcgiffin/'

// The supplied historical engraving is the only eligible hero media.
// Add it at src/assets/le-rouge-garden-plan.webp (or .avif, .jpg, .png).
const engravings = import.meta.glob<string>(
  '../assets/le-rouge-garden-plan.{webp,avif,jpg,png}',
  { eager: true, query: '?url', import: 'default' },
)
export const engravingSrc = Object.values(engravings)[0]
