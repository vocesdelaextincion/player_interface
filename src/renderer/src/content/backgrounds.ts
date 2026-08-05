export type MenuSide = 'left' | 'right'

export interface MenuBackground {
  src: string
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
// background and is skipped.
const NAME = /^(left|right)_menu(\d+)\.jpg$/i

function loadBackgrounds(): MenuBackground[] {
  const parsed = Object.entries(files).flatMap(([path, src]) => {
    const match = NAME.exec(path.split('/').pop() ?? '')
    if (!match) return []
    return [{ src, side: match[1].toLowerCase() as MenuSide, order: Number(match[2]) }]
  })

  const byOrder = (a: { order: number }, b: { order: number }): number => a.order - b.order
  const left = parsed.filter((b) => b.side === 'left').sort(byOrder)
  const right = parsed.filter((b) => b.side === 'right').sort(byOrder)

  // Interleaved rather than grouped, so the menu flips sides on every page turn instead of
  // sitting left for four screens and then right for four.
  const ordered: MenuBackground[] = []
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i]) ordered.push({ src: left[i].src, side: 'left' })
    if (right[i]) ordered.push({ src: right[i].src, side: 'right' })
  }
  return ordered
}

export const menuBackgrounds = loadBackgrounds()
