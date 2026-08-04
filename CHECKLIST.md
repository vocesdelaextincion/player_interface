# Deployment checklist

Run this on the kiosk machine after unpacking a build. Everything here needs a real touchscreen,
a real keyboard, or hours of wall-clock time — none of it can be verified from the build machine.

## Before the first install

- [ ] Windows version is 10 or newer, and 64-bit (see `README.md` — 7/8/8.1 and 32-bit do not run)
- [ ] Screen resolution noted, and images prescaled to it (`bun run prescale-images <sourceDir>`)
- [ ] Admin password changed from the default in `src/renderer/src/admin.ts`
- [ ] Real recordings and photography in `media/`, `content/recordings.json` updated

## State machine (`ARCHITECTURE.md`)

- [ ] Idle: images crossfade and pan; no UI chrome visible
- [ ] Idle → Active on any touch
- [ ] Active → Idle after 45s of no touch
- [ ] A playing track defers that timer — it does not cut out mid-recording
- [ ] F4 opens the password prompt from Idle, from Active, and from Locked
- [ ] Opening the prompt stops playback
- [ ] Wrong password shakes and clears; the prompt stays up
- [ ] Esc cancels back to the screen you came from (including back to Locked)
- [ ] Correct password from Idle/Active → action menu
- [ ] Correct password from Locked → straight to Idle, no menu
- [ ] Locked ignores all touch
- [ ] Close app quits; Restart app relaunches and comes back up fullscreen

## Player

- [ ] Tap hero image plays and pauses in place
- [ ] Moving to another recording stops the current one
- [ ] Track end stops and stays put — no auto-advance
- [ ] Scrub bar seeks by touch, including drag
- [ ] Tag chips filter; carousel resets to the first match

## Long-run (the reason this checklist exists)

- [ ] Leave it on Idle for 4+ hours. Memory in Task Manager should be flat, not climbing.
- [ ] Leave it on Active with a track looping for 1+ hour. Same.
- [ ] Watch a few Idle crossfades late in that run — if the pan/zoom stutters, set
      `kenBurnsEnabled = false` in `src/renderer/src/theme.ts` and rebuild. The crossfade is the
      mood-critical part; the pan is not.
- [ ] Cycle Idle → Active → Admin → Locked → Idle a dozen times and re-check memory. This is the
      path most likely to leak, since every screen mounts and unmounts listeners and timers.
