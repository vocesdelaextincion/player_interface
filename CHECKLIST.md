# Deployment checklist

Run this on the kiosk machine after unpacking a build. Everything here needs a real touchscreen or
hours of wall-clock time — none of it can be verified from the build machine.

## Before the first install

- [ ] App actually launches on the kiosk machine (Electron 22 pin; never verified on real hardware)
- [ ] RAM checked — 4GB, so `media/` stays in page cache and the hard disk goes idle after the
      first play (`free -h`; the integrated GPU also carves out 128–256MB)
- [ ] Hard disk SMART checked before trusting it — `Power_On_Hours`, `Reallocated_Sector_Ct`,
      `Current_Pending_Sector` (`sudo smartctl -a /dev/sda`)
- [ ] Touch layer enumerates and reports sane coordinates (`libinput list-devices`, `evtest`)
- [ ] Idle video plays at 0.5× without pegging a core — this GPU has no hardware H.264 decode
- [ ] Screen resolution noted, and backgrounds prescaled to it — and the idle video encoded at
      that resolution, not 1080p
      (`bun run prescale-images ../media-archive/backgrounds media/backgrounds`)
- [ ] Admin PIN changed from the default in `src/renderer/src/admin.ts` (digits only — the keypad
      cannot enter anything else)
- [ ] Real recordings and photography in `media/`, `content/recordings.json` updated
- [ ] Idle footage encoded from its master (`bun run encode-idle-video <master> --start s --end s`)
      — never drop a camera file straight into `media/videos/`
- [ ] `bun run blur-backgrounds` re-run after any background was added or replaced — a missing
      `*.blur.jpg` warns to the console and that screen simply never softens

## State machine (`ARCHITECTURE.md`)

- [ ] Idle: footage plays slowed and silent; no UI chrome but the instruction line
- [ ] Idle loops cleanly — watch the seam at the end of the clip, there should be no hitch or flash
- [ ] Idle → Recommendations on any touch
- [ ] Recommendations holds ~5s and moves to Active on its own, with nothing to press
- [ ] Active → Idle after 45s of no touch with nothing playing
- [ ] A sounding station defers that timer — it does not cut out mid-recording
- [ ] **Active → Farewell 90s after Active appears, whatever the visitor does.** Try it three
      ways: sitting still, touching continuously, and with sounds playing. All three must end
      at 90s.
- [ ] Farewell holds ~6s, ignores touch, returns to Idle
- [ ] Close app quits; Restart app relaunches and comes back up fullscreen

## Staff access — with the keyboard unplugged

The kiosk ships without one. Run this whole section before plugging a keyboard back in.

- [ ] A 3s press in the bottom-left corner opens the PIN prompt from Idle, Active and Locked
- [ ] A normal tap in that corner does nothing unusual — it still wakes Idle
- [ ] Opening the prompt stops playback
- [ ] The PIN can be entered entirely on the keypad; dots show length, never digits
- [ ] Wrong PIN shakes and clears; the prompt stays up
- [ ] _Cancelar_ returns to the screen you came from (including back to Locked)
- [ ] Correct PIN from Idle/Active → action menu; _Volver_ leaves it
- [ ] Correct PIN from Locked → straight to Idle, no menu
- [ ] Locked ignores all touch except that corner press

Then plug a keyboard in and confirm the old path still works: F4 opens the prompt, digits and
Enter submit, Esc cancels.

## Player

- [ ] A station shows exactly four icons and no titles
- [ ] Tapping an icon starts that recording and loops it; tapping again stops it
- [ ] Two or more sounds play together, each icon tinted green independently
- [ ] The whole photograph softens while anything sounds, and clears when the last sound stops
- [ ] The label names the most recently started recording, in the column the icons left free
- [ ] Turning the page stops everything on the outgoing station
- [ ] Arrows read _Anterior_ / _Siguiente_ and don't collide with the icon column

## Long-run (the reason this checklist exists)

- [ ] Leave it on Idle for 4+ hours. Resident memory should be flat, not climbing
      (`ps -o rss= -C player-interface`, sampled every few minutes).
- [ ] Leave it on Active with a track looping for 1+ hour. Same.
- [ ] **Start all four sounds on one station at once and listen.** This is the new ceiling and the
      one thing this round couldn't be checked from the build box: four concurrent FLAC decodes on
      an Athlon II. Crackle, stutter or drift means it doesn't hold — cap concurrency or
      re-encode the catalog to a lower sample rate before reaching for anything cleverer.
- [ ] Turn the page twenty times with sounds playing and re-check memory. Each turn builds and
      tears down four `<audio>` elements, so this is where a leak in the new engine would show.
- [ ] Watch the blur crossfade on the real panel. It's a plain opacity swap between two decoded
      images, but it is the only thing Active animates full-bleed.
- [ ] Watch idle footage late in that run. Video decode is the heaviest thing this app does, so
      this is where an old machine will show strain first. If it stutters, raise
      `idleVideoPlaybackRate` in `src/renderer/src/theme.ts` (closer to 1 = fewer frames held
      = less work) or re-encode the clips smaller than 1080p.
- [ ] Cycle Idle → Recomendaciones → Active → Despedida → Idle a dozen times, and again via Admin
      and Locked, re-checking memory. This is the path most likely to leak, since every screen
      mounts and unmounts listeners and timers — and there are two more screens than there were.
