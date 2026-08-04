// Motion tokens for Framer Motion (needs JS values, not CSS custom properties).
// Keep in sync with assets/theme.css and DESIGN.md.

export const easeCinematic = [0.16, 1, 0.3, 1] as const

export const duration = {
  idleVideoFade: 0.6, // fade through black between idle clips
  state: 1,
  carousel: 0.6,
  feedback: 0.2
}

// How slowly idle footage plays. There is no frame interpolation, so this trades smoothness for
// drift: the source is ~30fps, meaning 0.5 shows each frame twice (~15fps) and 0.25 shows it four
// times (~7.5fps, visibly stepped). Lower it only if the judder reads as intentional on the real
// screen.
export const idleVideoPlaybackRate = 0.5
