# Stages

Assumption: TypeScript for the app (consistent with the other `voces` projects, and worth the safety on something that runs unattended all day). Flag if you'd rather plain JS.

Each stage should be shippable/demoable on its own before moving to the next.

## Stage 1 — Scaffolding & tooling
- [ ] Electron + React + TypeScript project (Vite-based)
- [ ] CSS Modules wired up
- [ ] Framer Motion installed
- [ ] Fraunces + Inter bundled locally, `@font-face` set up
- [ ] Design tokens from `DESIGN.md` as a theme file (colors, type scale, motion durations)
- [ ] Kiosk window: fullscreen, frameless, no menu bar, cursor hidden, devtools/right-click/text-select/pinch-zoom disabled
- [ ] `dev` / `build` / `package` npm scripts

## Stage 2 — Content pipeline
- [ ] `content/recordings.json` schema + loader
- [ ] `media/audio`, `media/images` folders with a few sample recordings for dev
- [ ] Loader skips entries with missing/unloadable files (console warning, no crash)
- [ ] Build-time script to pre-scale images to screen resolution

## Stage 3 — App shell & state machine
- [ ] Idle / Active / Admin / Locked container, per `ARCHITECTURE.md`
- [ ] Global F4 listener → Admin prompt from any state, stops playback
- [ ] Esc cancels Admin prompt back to previous state
- [ ] 45s inactivity timer, Active → Idle (deferred while a track plays)
- [ ] Transitions wired to `motion-state` token

## Stage 4 — Idle screen
- [ ] Full-bleed image crossfade cycle
- [ ] Ken Burns pan/zoom, with a config flag to fall back to crossfade-only if it stutters on the real hardware
- [ ] Any touch → Active

## Stage 5 — Active screen: browse + player
- [ ] Full-bleed carousel, one recording centered
- [ ] Left/right arrow nav (tap only, no gestures)
- [ ] Tag-filter chip row
- [ ] Tap hero image → play/pause in place, overlay controls + scrub bar
- [ ] Single reusable `<audio>` element; switching recordings stops the current one
- [ ] Track end: stop, stay put (no auto-advance)
- [ ] Scrub bar seekable by touch

## Stage 6 — Admin & Locked screens
- [ ] Password prompt (toned-down theme), shake feedback on wrong password
- [ ] Actions: Close app, Restart app, Lock
- [ ] Locked: block all touch, listen only for F4
- [ ] Hardcoded password constant

## Stage 7 — Styling pass
- [ ] Full `DESIGN.md` token set applied across every screen
- [ ] Type scale applied (Fraunces display / Inter UI)
- [ ] Touch-target audit (64px minimum everywhere)

## Stage 8 — Stability & packaging
- [ ] Multi-hour soak test on the real (or comparable) machine, watch memory
- [ ] Confirm animations only touch `transform`/`opacity`, one full-bleed animated layer at a time
- [ ] Electron build/package for the target OS
- [ ] Manual pass against the full `ARCHITECTURE.md` behavior list
