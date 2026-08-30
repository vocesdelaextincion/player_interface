# Design System

## Mood
Cinematic and moody — dark, nature-documentary feel. Imagery and motion carry the drama; UI stays quiet and gets out of the way.

## Color

Three colors. Black, green, white — nothing else.

| Source | Value | Character |
|---|---|---|
| `--rgb-black` | `6 17 10` → `#06110A` | Near-black, L\* 4.17. The green channel leads the others by 7, enough that the tint is actually perceptible on a large flat area (Admin, Locked) instead of being merely technical. |
| `--rgb-green` | `58 125 86` → `#3A7D56` | The only accent. Mossy and deliberately recessive — the chrome stays quiet so photography dominates. |
| `--rgb-white` | `241 245 241` → `#F1F5F1` | Off-white carrying the same faint green cast, so the palette has one temperature. |

Every other colour in the app is one of those three at reduced alpha — there is no fourth hue:

| Token | Derivation | Use |
|---|---|---|
| `--color-bg` | black | Base background |
| `--color-text` | white | Primary text |
| `--color-accent` | green | Interactive: sounding station icon, keypad confirm |
| `--color-text-muted` | white @ 56% | Metadata, tags, hints, Volver |
| `--color-accent-dim` | green @ 60% | Staff outlines — admin buttons, keypad keys, PIN dots |
| `--overlay-gradient` | black 88% → 0% | Bottom-up gradient over photos, for text legibility |

They're stored as channel triplets rather than hex so the alpha variants derive from the source
values instead of restating them. Chromium 108 (Electron 22, see `README.md`) has no `color-mix()`,
so `rgb(var(--rgb-white) / 0.56)` is the mechanism. **Change a triplet and the whole app follows.**

Measured contrast on the background: white text **17.5:1** (AAA), muted text **6.0:1** (AA), green
**3.9:1** — fine for the large controls it fills, and it is never used for small text on black.

One rule falls out of this and must hold: **text and glyphs on the green are always white, never
black.** The mossy green is dark enough that black-on-green drops to 3.9:1 while white-on-green
reaches 4.5:1. Neither is generous, so the green is only ever filled behind *large* elements — a
sounding station icon, the keypad's confirm key. Do not put small text on it.

If the green is ever lightened again, recheck this: with a lighter green the rule inverts and black
becomes the correct foreground.

There is no hover token. The kiosk is touch-only with the cursor hidden, so press feedback is
`:active`, and a hover state would be dead weight.

Photos are shown full color, as shot — no color grading. Color consistency across the catalog comes from the surrounding UI, not the images.

## Typography

- **Display (species name, recording title):** serif — [Fraunces](https://fonts.google.com/specimen/Fraunces). Warm, editorial, documentary-title character. 64-96px at fullscreen scale.
- **UI / body / tags:** sans — [Inter](https://fonts.google.com/specimen/Inter). Neutral, clean, high legibility for metadata and controls.

| Token | Size | Use |
|---|---|---|
| `--text-display` | `clamp(56px, 7.5vh, 88px)` | Species name — the Active label, interstitial headings |
| `--text-display-sub` | `clamp(24px, 3vh, 34px)` | Recording title, italic, beneath the species |
| `--text-staff` | `40px` | Admin / Locked headings (toned down on purpose) |
| `--text-body` | `18px` | Admin action buttons |
| `--text-meta` | `14px` | Tags, arrow labels, hints — uppercase + letter-spaced where it's a label |

The two display sizes are `vh`-clamped rather than fixed. The target kiosk's resolution isn't confirmed, and a fixed 88px species name that reads well at 1080p crowds the hero at 768p. This isn't responsive design — no breakpoints, no reflow, just fluid type against an unknown screen.
- Both fonts **bundled in the repo** (`@font-face`, local files) — the kiosk has no internet; a Google Fonts link would silently fall back to system serif.
- Tags/category labels: small, uppercase, letter-spaced (documentary lower-third style).

## Motion

Slow and cinematic for anything ambient or state-level; a touch snappier only for direct feedback.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-ambient` | 1.2s fade through black, each way | `easeInOut` | Idle video clip changes |
| `motion-state` | 900-1200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Idle ↔ Active, Admin/Locked transitions |
| `motion-carousel` | 500-700ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Moving between stations |
| `motion-feedback` | 150-250ms | standard ease | Play/stop toggle, button press, blur and label crossfade |

Hard rule for the old kiosk machine: animate `transform` and `opacity` only, one full-bleed animated layer at a time. Idle honours this by fading a single video element out to black before swapping its source, rather than cross-fading two clips — two simultaneous 1080p decodes is the one thing most likely to sink the target hardware. If idle still stutters, raise `idleVideoPlaybackRate` toward 1 before touching anything else.

## Layout — per state

- **Idle:** full-bleed video, played slowed and silent, `object-fit: cover`, behind a flat dimming veil. Random clip order, a 1.2s fade through black between them. The only chrome is one line of sans instruction, bottom-centred, letter-spaced — an invitation, not a control.
- **Active:** full-bleed background photograph with a gradient running inward from the menu side. Four recordings scattered across that side, left or right per the background's filename — each one a play/stop glyph on a translucent disc and nothing else. Scattered rather than stacked: a column is read top to bottom, one after another, and the mix is meant to be built by poking at whatever catches the eye. The spots are hand-placed, one arrangement per station and cycled with the pages, so a page turn moves the icons as well as the photograph. The titles that used to sit beside them are gone: four identical pressable shapes read as a set of things to try *together*, which is what a mix asks for, where a list of named rows reads as a queue to work through. Playing disc tints `accent`; pressing lightens rather than darkens, so feedback survives on a dark backdrop.

  The moment anything sounds, three things change at once on `opacity`: a baked blur fades in over the whole photograph, a flat veil joins the directional one, and the recording most recently started is named in the column the icons left free — species in Fraunces, title in Fraunces italic, tags in small caps sans. That split is the point: the serif names the animal, the sans is the interface. The blur has to reach the whole frame rather than stopping at the gradient, because the label now lives on the side the gradient was built to leave clean.

  Carousel arrows sit at the top edge, pushed to opposite corners and inset to the same 6vw as the icon column. They are pills, not bare glyphs — with the recordings unnamed, an unlabelled arrow gives a visitor no way to tell whether it moves between sounds or between stations, so each one says *Anterior* / *Siguiente* with the glyph on the outer edge. Tap only, no swipe — the touchscreen may not support gestures reliably.
- **Recomendaciones / Despedida:** one shared frame for the two screens that only speak and then move on — the exhibit photograph already out of focus, a heavy flat veil, and a centred column. They take no input at all, so there is no control for a visitor to miss and nothing to get stuck on. Fraunces heading, sans body; the farewell is the same frame with less on it.
- **Admin:** the staff background (`admin_menu.jpg`) under a much heavier veil than any visitor screen — the photograph is present but pushed right back, so staff mode never looks like the exhibit. Content is a single left-aligned column sharing the recording menu's panel language. A top-left accent-outlined badge reading *Panel de administración* is always visible, on both the password gate and the action menu; it's a mode marker, not a heading, which is why it stays put while the heading below it changes. Buttons and the keypad keys carry an `accent-dim` outline on top of the panel fill — on this darker screen the fill alone didn't separate them from the veil. The destructive action (Cerrar aplicación) takes a muted outline instead, so it reads as the odd one out, and *Volver* drops the panel entirely so it reads as leaving rather than as a fourth action.

  The PIN is entered on a 3x4 keypad, since the kiosk has no keyboard. Keys are 76px, above the 64px floor — staff press these standing at an angle to the screen, usually in a hurry. The confirm key is the one filled `accent` element on any staff screen, which is exactly the case DESIGN allows: a large shape carrying a white glyph. Entry is shown as dots, never digits: staff unlock this in front of visitors.
- **Locked:** same frame as Admin — same background, veil and left column — badged *Modo bloqueo*. Nothing on it is interactive; the frame swallows every touch so wiping the glass can't drive the UI. Note it is the one screen that may sit untouched for a long stretch during cleaning, so if burn-in ever shows on the kiosk panel, this is the screen to make flat again.

## Touch targets

Minimum 64px hit area (larger than typical web 44px minimum) — public kiosk, no precision or familiarity assumed from visitors.

Audited at Stage 7 and again at Stage 9 — every interactive element carries `min-height: var(--touch-target-min)`: admin buttons and *Volver* (64px), keypad keys (76px), station icons (112px), carousel arrow pills (64px tall, wider than that with their labels).
