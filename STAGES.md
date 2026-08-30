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
- [x] Full-bleed carousel of station backgrounds, menu side per filename
- [x] Left/right arrow nav (tap only, no gestures)
- [x] Tap a recording → play/pause in place
- [x] Single reusable `<audio>` element; switching recordings stops the current one
- [x] Track end: stop, stay put (no auto-advance)
- [x] Player bar with a touch-seekable scrub bar

Written against the hero-image player this stage started as; commit `a8ad776` replaced that with
the background carousel and dropped the centred hero and the tag-filter chip row. Stage 9 then
replaced the rest of it — see there for what the screen actually does now.

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

Superseded by Stage 9 on the way in: the gate is no longer F4-and-type. A 3s press in the
bottom-left corner opens it too, and the password is a PIN on an on-screen keypad — Locked
included, which is why the corner press is listened for on the window rather than on the frame.

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

Caveat on "one full-bleed animated layer": the carousel slide needs two layers by definition, for
600ms per move. Both are transform/opacity, so they stay on the compositor.

Superseded for Idle: the image crossfade described here was replaced by slowed video, which never
composites two layers — it fades a single element to black before swapping source, precisely to
avoid two simultaneous decodes. Video decode is now the heaviest thing the app does and the most
likely thing to strain the kiosk; `idleVideoPlaybackRate` is the first dial to turn.

Packaging: the deliverable is `bun run build:win:zip`, unpacked and run directly on the kiosk.
`framer-motion` moved to `devDependencies` (the renderer bundle already inlines it, and main and
preload never import it), which cut the asar from 9.1MB to 1.2MB.

Electron pinned back to 22.3.27 once the kiosk was confirmed as Windows 8 — 23 dropped that OS. The
pin also restored 32-bit Windows, so builds now cover Win 7/8/8.1/10/11 (x64 + ia32), Linux AppImage,
and macOS from one config. `electron.vite.config.ts` pins `chrome108`/`node16` targets to match;
without them the build succeeds but the kiosk shows a blank window. The `deb` target was dropped —
it needs a maintainer email nobody has supplied.

The two open items are genuinely blocked on the physical machine — a soak test and a touch pass can't
be faked from a build box. `CHECKLIST.md` is written so whoever has the kiosk can run them.

## Stage 9 — Client feedback, round 1
From `voces`, after showing the Stage 8 build. Three items break invariants Stages 3-5 were built
on, so this is a redesign of the visitor interaction rather than a polish pass.

- [x] Four sounds per station, not five
- [x] Visible labels on the carousel arrows
- [x] Menu reduced to play/stop icons; titles moved to a label in the free column
- [x] Sounds layer and loop — one `<audio>` per slot on the current station, no transport bar
- [x] Baked blur across the whole photograph while a station sounds
- [x] Recommendations screen on the way out of Idle, auto-advancing
- [x] 90s hard cap on a visit, ending in a farewell screen
- [x] Admin reachable by a 3s corner press; PIN entered on an on-screen keypad
- [ ] Confirm four concurrent FLAC decodes hold on the kiosk — **needs hardware**, see `CHECKLIST.md`

The mixing change is the one with teeth. `useAudioPlayer` was built around the single element
ARCHITECTURE.md's "Long-run stability" section asks for, and layering needs one per sound; the
replacement (`useSoundboard`) scopes them to the *current station* and tears them down on every
page turn, so the count is bounded at four rather than growing with the catalog. Whether four
simultaneous decodes hold on a Windows 8 kiosk can only be answered on the machine. If they don't,
cap concurrency or re-encode the catalog before reaching for anything cleverer.

The 45s inactivity timer kept its `isPlaying` guard, against the first reading of the note. Looping
sounds would otherwise defer the return to Idle forever — but the 90s cap sits above it and cannot
be deferred, so the guard is bounded now and a visitor listening without touching isn't cut off at
45 seconds.

`filter: blur()` is not used anywhere and should not be: the blurred backgrounds are baked by
`bun run blur-backgrounds` and crossfaded on `opacity`, which keeps the Stage 8 animation audit
true. **Run that script whenever a background is added or replaced** — a missing variant warns to
the console and the screen simply never softens.

The admin password became a digits-only PIN, since the keypad is now the primary way in. It is
still the default in `src/renderer/src/admin.ts` and still has to be changed before install.

## Stage 10 — Idle footage replaced
- [x] `voces_background.mkv` (4K VP9, 3:00, 306MB) trimmed 50s off the head and 20s off the tail
- [x] Re-encoded to 1080p H.264, audio stripped — 1:50, 95MB at 7.3 Mbps
- [x] The four `microvoces-*` clips removed; this is now the only idle clip
- [x] `scripts/encode-idle-video.mjs` + `bun run encode-idle-video`, so the recipe isn't folklore
- [x] Single clip loops on the video element rather than through the `ended` handler

Bitrate is deliberately in line with the clips it replaces (they ran 7-13 Mbps), so nothing about
the decode load is new territory for the kiosk — only the running time is. It plays at the same
`idleVideoPlaybackRate = 0.5` as before, which on this 23.976fps source means ~12 unique frames a
second and a loop lasting about 3:40 on screen.

The file is 95MB against the 43MB of the four it replaces. It stays that size on purpose: matching
the encode profile already proven on this hardware was worth more than the disk, and the repo
already carries far larger masters and FLAC.

Native `loop` replaced the old restart-on-`ended` branch. That branch worked, but the round trip
through React showed a hitch at the seam — invisible when it happened every 12 seconds between
different clips, obvious when it is the only cut the screen ever makes.

## Stage 11 — Media working tree trimmed
- [x] Camera masters and full-res originals moved to `../media-archive/`, outside the project
- [x] `media/images/` retired — the sample photos were bundled but rendered nowhere
- [x] `image` dropped from the `recordings.json` schema and its loader
- [x] `media-archive/README.md` records what each folder is and how to regenerate from it

`media/` went from 943MB to 194MB, and the renderer bundle stopped carrying three sample photos it
never drew. **This does not shrink the repository** — the masters are still in git history, so
`.git` stays around 1GB. The point was the working tree, not the clone.

Dropping `image` was the only part that touched code. Nothing had rendered a per-recording photo
since the Stage 9 redesign: a station *is* a photograph, and the label that appears on tap names
the recording in words. The field was worse than unused — the loader treated a missing image as
grounds to skip the entire recording, so an absent placeholder would have silently emptied the
catalog. Re-adding it later is a field, a glob and a resolve call; the reason to remove it now is
that leaving it made the archive move a trap.

Nothing in the build reads `media-archive/`. All three asset scripts take a path argument, so they
keep working by pointing at it — the commands are in that folder's README.

## Stage 12 — Linux kiosk port
Target machine changed: no longer a Windows 8 box, now an old desktop (Gigabyte GA-M68MT-S2,
AMD Athlon II, integrated GeForce 7025, VGA panel + USB touch, mechanical HDD, no network).

- [x] `ARCHITECTURE.md` "Target machine and packaging" rewritten for the Linux target
- [x] `README.md` deliverable switched to `build:linux` / `apt install`
- [x] `CHECKLIST.md` hardware gates replaced (RAM, SMART, touch, decode headroom)
- [ ] **Step 0 — measure the machine.** Nothing below is worth building first.
      Panel resolution (`xrandr`); RAM (`free -h`); SMART (`smartctl -a`); touch enumerates
      (`libinput list-devices`); idle video plays at 0.5x without pegging a core; and whether
      a *modern* Electron launches at all, which settles the pin question below
- [ ] Debian 13 netinst, no tasks selected. X11 + openbox + pipewire + python3-tk + xterm
- [ ] Decide read-only root (see below) — this changes partitioning, so decide before installing
- [ ] `kiosk/` in this repo: autologin drop-in, `.xinitrc`, `voces-menu`, openbox config,
      polkit rule. Deliberately outside the `.deb`, which is reinstalled on every update
- [ ] `src/main/index.ts`: `app:quit` → `app.exit(42)`, plus a single-instance lock
- [ ] `electron-builder.yml`: Linux target `AppImage` → `deb`, add `maintainer`
- [ ] `ADMIN_PIN` changed off `'2024'` (still open from Stage 6)
- [ ] Idle video re-encoded at panel resolution instead of 1080p

The port is low-risk on the app side and that is worth stating plainly: there is no `win32`
code path anywhere in `src/`, no native modules, no serial or GPIO. Windows was only ever a
packaging target. Almost all of this stage is OS provisioning.

Two hardware facts drive the design and are written up in `ARCHITECTURE.md`. The GeForce 7025
has no VDPAU — hardware H.264 decode starts at GeForce 8 — so the idle video is decoded
entirely on the CPU, and encoding it at 1080p for a smaller panel is the most expensive
avoidable thing the machine does. And nouveau is the only viable driver (NVIDIA's 304.xx
legacy branch is long dead), which means OpenGL 2.1 with no usable GLES2, which rules out
Wayland and `cage`. X11 is a hardware consequence here, not a preference.

The Electron 22 pin outlived its reason. It existed because 22.3.27 was the last release
supporting Windows 8; that machine is gone. It now survives only because it is known-good on
an offline box, and because the Athlon II is K10 — SSE4a but **not** SSE4.1/4.2 — so a modern
Electron may not start at all. Expect `SIGILL` rather than a clean error. Step 0 settles it;
until then the pin and the `chrome108`/`node16` Vite targets stay.

Admin grew outward rather than inward. Instead of a bigger in-app panel, quitting from the
admin screen exits with **code 42**, and the shell loop in `.xinitrc` shows a four-button touch
menu — *Voces de la extinción*, *Reiniciar*, *Apagar*, *Terminal*. Any other exit status is a
crash and the app restarts silently. Two things fall out of that for free: crash recovery,
which the app never had (Stage 8's note that staff restart it by hand is now false), and a
menu that is already PIN-gated without a second PIN, since the only way to reach it is through
the existing corner-hold gate.

**Open decision: read-only root.** A USB stick as root was considered and rejected — this
board is USB 2.0 only (~30MB/s, slower than the HDD it would replace), sticks have no real
wear leveling under a read-write root, and one protruding from a museum kiosk is a yank away
from an unbootable machine. But the instinct behind it is right: the kiosk gets its power cut
at closing time every day, and a root filesystem that is never written to cannot be corrupted
by that. `noatime`, `journald Storage=volatile`, tmpfs `/tmp`, no swap, optionally
`overlayroot`. The payoff is power-cut immunity, not wear. Decide before partitioning.
