// Motion tokens for Framer Motion (needs JS values, not CSS custom properties).
// Keep in sync with assets/theme.css and DESIGN.md.

export const easeCinematic = [0.16, 1, 0.3, 1] as const

export const duration = {
  ambientCrossfade: 2.5,
  ambientHold: 25, // seconds an idle image stays fully visible before crossfading to the next
  state: 1,
  carousel: 0.6,
  feedback: 0.2
}

// Flip to false if the pan/zoom stutters on the real kiosk hardware — the crossfade
// alone is the mood-critical part (see DESIGN.md Motion).
export const kenBurnsEnabled = true
