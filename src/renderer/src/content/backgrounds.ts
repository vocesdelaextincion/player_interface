export type MenuSide = 'left' | 'right'

export interface MenuBackground {
  src: string
  /** Pre-blurred twin, faded in while the station is sounding. See scripts/blur-backgrounds.mjs. */
  blurredSrc: string | undefined
  side: MenuSide
}

// Non-recursive, so the 4592px originals in backgrounds/masters/ never reach the build.
const files = import.meta.glob('../../../../media/backgrounds/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

// The filename is the layout instruction: `left_menu2.jpg` means "on this screen, the recording
// menu sits on the left". Anything not matching that pattern (admin_menu.jpg) isn't a carousel
// background and is skipped. `left_menu2.blur.jpg` is that screen's baked blur, paired below
// rather than listed as a screen of its own.
const NAME = /^(left|right)_menu(\d+)\.jpg$/i
const BLURRED = /^(left|right)_menu(\d+)\.blur\.jpg$/i

function fileName(path: string): string {
  return path.split('/').pop() ?? ''
}

function loadBackgrounds(): MenuBackground[] {
  const blurred = new Map(
    Object.entries(files).flatMap(([path, src]) => {
      const match = BLURRED.exec(fileName(path))
      return match ? [[`${match[1].toLowerCase()}${match[2]}`, src] as const] : []
    })
  )

  const parsed = Object.entries(files).flatMap(([path, src]) => {
    const match = NAME.exec(fileName(path))
    if (!match) return []
    const side = match[1].toLowerCase() as MenuSide
    const order = Number(match[2])
    // A missing blur is survivable — the screen just never softens — so it warns rather than
    // dropping the whole background, same as the recordings loader.
    const blurredSrc = blurred.get(`${side}${order}`)
    if (!blurredSrc) {
      console.warn(`[backgrounds] no blurred variant for ${fileName(path)} — run blur-backgrounds`)
    }
    return [{ src, blurredSrc, side, order }]
  })

  const byOrder = (a: { order: number }, b: { order: number }): number => a.order - b.order
  const left = parsed.filter((b) => b.side === 'left').sort(byOrder)
  const right = parsed.filter((b) => b.side === 'right').sort(byOrder)

  // Interleaved rather than grouped, so the menu flips sides on every page turn instead of
  // sitting left for four screens and then right for four.
  const ordered: MenuBackground[] = []
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i]) ordered.push({ src: left[i].src, blurredSrc: left[i].blurredSrc, side: 'left' })
    if (right[i])
      ordered.push({ src: right[i].src, blurredSrc: right[i].blurredSrc, side: 'right' })
  }
  return ordered
}

export const menuBackgrounds = loadBackgrounds()

// Staff-only screens share one background, separate from the visitor carousel.
export const adminBackground: string | undefined = Object.entries(files).find(
  ([path]) => fileName(path).toLowerCase() === 'admin_menu.jpg'
)?.[1]
