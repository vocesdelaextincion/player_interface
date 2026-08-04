# Design System

## Mood
Cinematic and moody — dark, nature-documentary feel. Imagery and motion carry the drama; UI stays quiet and gets out of the way.

## Color

| Token | Value | Use |
|---|---|---|
| `bg` | `#0D110F` | Base background (warm-black, slight green tint) |
| `text` | `#F2F1EC` | Primary text (warm off-white, not pure white) |
| `text-muted` | `#A8ACA6` | Secondary text, metadata, tags |
| `accent` | `#4F9D6E` | Interactive elements: active states, controls, progress |
| `accent-hover` | `#79C39A` | Hover/active-press feedback |
| `accent-dim` | `#2E4A3B` | Disabled/inactive accent variant |
| `overlay` | `rgba(0,0,0,0.85)` → `rgba(0,0,0,0)` | Gradient over photos, bottom-up, for text legibility |

Photos are shown full color, as shot — no color grading. Color consistency across the catalog comes from the surrounding UI, not the images.

## Typography

- **Display (species name, recording title):** serif — [Fraunces](https://fonts.google.com/specimen/Fraunces). Warm, editorial, documentary-title character. 64-96px at fullscreen scale.
- **UI / body / tags:** sans — [Inter](https://fonts.google.com/specimen/Inter). Neutral, clean, high legibility for metadata and controls.

| Token | Size | Use |
|---|---|---|
| `--text-display` | `clamp(56px, 7.5vh, 88px)` | Species name — the Active hero |
| `--text-display-sub` | `clamp(24px, 3vh, 34px)` | Recording title, italic, beneath the species |
| `--text-staff` | `40px` | Admin / Locked headings (toned down on purpose) |
| `--text-body` | `18px` | Admin action buttons |
| `--text-meta` | `14px` | Tags, timecodes, hints — uppercase + letter-spaced where it's a label |

The two display sizes are `vh`-clamped rather than fixed. The target kiosk's resolution isn't confirmed, and a fixed 88px species name that reads well at 1080p crowds the hero at 768p. This isn't responsive design — no breakpoints, no reflow, just fluid type against an unknown screen.
- Both fonts **bundled in the repo** (`@font-face`, local files) — the kiosk has no internet; a Google Fonts link would silently fall back to system serif.
- Tags/category labels: small, uppercase, letter-spaced (documentary lower-third style).

## Motion

Slow and cinematic for anything ambient or state-level; a touch snappier only for direct feedback.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-ambient` | 2-3s crossfade, ~20-30s hold | linear/ease | Idle background image cycling |
| `motion-state` | 900-1200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Idle ↔ Active, Admin/Locked transitions |
| `motion-carousel` | 500-700ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Moving between recordings |
| `motion-feedback` | 150-250ms | standard ease | Play/pause toggle, button press |

Hard rule for the old kiosk machine: animate `transform` and `opacity` only, one full-bleed animated layer at a time. If Ken Burns stutters on the target hardware, drop the pan/zoom and keep only the crossfade — the crossfade is the mood-critical part.

## Layout — per state

- **Idle:** full-bleed species photo(s), slow Ken Burns pan/zoom, slow crossfade between images. No visible UI chrome.
- **Active:** full-bleed carousel, one recording centered at a time. Tapping the hero image plays it in place — play/pause overlay + scrub bar directly on the photo, title + tag beneath. Large arrow buttons (left/right edges) to move between recordings — tap only, no swipe/gesture input anywhere; the touchscreen may not support gestures reliably. Tag-filter chips in a row along the top edge; active chip in `accent`.
- **Admin / Locked:** same theme (dark bg, same type/accent), toned down — no ambient animation, flat and static, so it clearly reads as a distinct, staff-only mode.

## Touch targets

Minimum 64px hit area (larger than typical web 44px minimum) — public kiosk, no precision or familiarity assumed from visitors.

Audited at Stage 7 — every interactive element carries `min-height: var(--touch-target-min)`: tag chips, scrub track, admin buttons, password field (64px), play button (72px), carousel arrows (88px). The carousel dots are deliberately *not* interactive; they're a position indicator, so their 8px size is fine.
