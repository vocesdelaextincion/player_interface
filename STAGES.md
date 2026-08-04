# Stages

Assumption: TypeScript for the app (consistent with the other `voces` projects, and worth the safety on something that runs unattended all day). Flag if you'd rather plain JS.

Each stage should be shippable/demoable on its own before moving to the next.

## Stage 1 — Scaffolding & tooling ✅
- [x] Electron + React + TypeScript project (Vite-based)
- [x] CSS Modules wired up
- [x] Framer Motion installed
- [x] Fraunces + Inter bundled locally, `@font-face` set up
- [x] Design tokens from `DESIGN.md` as a theme file (colors, type scale, motion durations)
- [x] Kiosk window: fullscreen, frameless, no menu bar, cursor hidden, devtools/right-click/text-select/pinch-zoom disabled
- [x] `dev` / `build` / `package` npm scripts

Note: this machine's default Node (v26) silently breaks Electron's own binary extraction — no
error, it just truncates. Node 22 LTS is pinned via `.nvmrc`/`.node-version`/`engines`. If a fresh
`bun install` ever produces an `Error: Electron uninstall` on `bun run dev` again, re-run
`node_modules/electron/install.js` under Node 22.

## Stage 2 — Content pipeline ✅
- [x] `content/recordings.json` schema + loader
- [x] `media/audio`, `media/images` folders with a few sample recordings for dev
- [x] Loader skips entries with missing/unloadable files (console warning, no crash)
- [x] Build-time script to pre-scale images to screen resolution

Sample media is placeholder only (tone mp3s, labeled color blocks) — swap for real recordings/photography whenever it's sourced.

## Stage 3 — App shell & state machine ✅
- [x] Idle / Active / Admin / Locked container, per `ARCHITECTURE.md`
- [x] Global F4 listener → Admin prompt from any state, stops playback
- [x] Esc cancels Admin prompt back to previous state
- [x] 45s inactivity timer, Active → Idle (deferred while a track plays)
- [x] Transitions wired to `motion-state` token

## Stage 4 — Idle screen ✅
- [x] Full-bleed image crossfade cycle
- [x] Ken Burns pan/zoom, with a config flag to fall back to crossfade-only if it stutters on the real hardware
- [x] Any touch → Active

## Stage 5 — Active screen: browse + player ✅
- [x] Full-bleed carousel, one recording centered
- [x] Left/right arrow nav (tap only, no gestures)
- [x] Tag-filter chip row
- [x] Tap hero image → play/pause in place, overlay controls + scrub bar
- [x] Single reusable `<audio>` element; switching recordings stops the current one
- [x] Track end: stop, stay put (no auto-advance)
- [x] Scrub bar seekable by touch

## Stage 6 — Admin & Locked screens ✅
- [x] Password prompt (toned-down theme), shake feedback on wrong password
- [x] Actions: Close app, Restart app, Lock
- [x] Locked: block all touch, listen only for F4
- [x] Hardcoded password constant

Resolved: unlocking from Locked skips the action menu and goes straight to Idle, per
`ARCHITECTURE.md`'s direct arrow. Locked is screen-cleaning mode, so the staff intent on unlock is
"resume normal operation"; F4 reopens the menu if they actually wanted it. Both entry paths share
one password gate — `AdminScreen` branches on `cameFromLocked`.

Close/Restart are the first renderer actions needing the main process, so this stage added
`app:quit` / `app:restart` IPC (`src/main/index.ts`) exposed as `window.api` via the preload.

## Stage 7 — Styling pass ✅
- [x] Full `DESIGN.md` token set applied across every screen
- [x] Type scale applied (Fraunces display / Inter UI)
- [x] Touch-target audit (64px minimum everywhere)

Touch targets already passed — no element needed resizing. The real fixes were typographic: the
Active hero was rendering `species — title` as one 64px line, which wraps badly once real Spanish
species names land, so species and title are now two display elements. Type scale lives in
`theme.css` as tokens; display sizes are `vh`-clamped against the unconfirmed target resolution.

Still judged against placeholder color blocks — the overlay-gradient legibility call needs a second
look once real photography lands.

## Stage 8 — Stability & packaging
- [x] Confirm animations only touch `transform`/`opacity`, one full-bleed animated layer at a time
- [x] Electron build/package for the target OS
- [ ] Multi-hour soak test on the real (or comparable) machine, watch memory — **needs hardware**
- [ ] Manual pass against the full `ARCHITECTURE.md` behavior list — **needs hardware**, see `CHECKLIST.md`

Animation audit: no CSS transitions or keyframes exist at all — every animation goes through Framer
Motion, and all of them move only `opacity`, `scale`, `x`, `y`. The one violation found was the scrub
bar's progress fill, which drove `width` ~4x/sec for the length of every track; it's now `scaleX`.
Listener/timer cleanup is balanced (10 registrations, 10 teardowns).

Caveat on "one full-bleed animated layer": a crossfade and a slide both need two layers by
definition, so Idle composites two for 2.5s of every 27.5s cycle, and the carousel for 600ms per
move. Both are transform/opacity, so they stay on the compositor. `kenBurnsEnabled = false` collapses
the Idle case to opacity-only if the real hardware struggles.

Packaging: the deliverable is `bun run build:win:zip` → a 127MB zip, unpacked and run directly on the
kiosk. `framer-motion` moved to `devDependencies` (the renderer bundle already inlines it, and main
and preload never import it), which cut the asar from 9.1MB to 1.2MB.

The two open items are genuinely blocked on the physical machine — a soak test and a touch pass can't
be faked from a build box. `CHECKLIST.md` is written so whoever has the kiosk can run them.
