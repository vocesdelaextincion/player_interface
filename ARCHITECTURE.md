# Architecture

## States

- **Idle** — ambient animation, default resting screen. Any touch → Active.
- **Active** — full-bleed carousel, one recording centered at a time, tag-filter chip row above. Tap the hero image to play/pause in place. No touch for 45s **and** no audio playing → back to Idle (a playing track defers the timer until it ends).
- **Admin** — password-gated, opened by F4 from any state. Opening the prompt stops playback. Wrong password: shake feedback, stay on prompt. Esc cancels back to previous state. Actions: Close app, Restart app, Lock.
- **Locked** — freezes all touch input (screen-cleaning mode); only F4 is listened for. Unlocked the same way it was entered (F4 + password) → returns to Idle.

```
Idle    --touch-->        Active
Active  --45s idle-->     Idle
any     --F4+password-->  Admin
Admin   --Close-->        (quit)
Admin   --Restart-->      app.relaunch() + exit
Admin   --Lock-->         Locked
Locked  --F4+password-->  Idle
```

## Playback

- One track at a time; moving to another recording stops the current one.
- Track end: stop, stay on the current recording (no auto-advance).
- Scrub bar is seekable by touch.

## Content

No backend, no internet. Audio and images are bundled in the repo.

```
media/
  audio/       *.flac (*.mp3 also accepted)
  images/      *.jpg
content/
  recordings.json
```

Audio is lossless FLAC — the kiosk plays from local disk with no bandwidth constraint, so there's
no reason to throw quality away. The loader's glob is **extension-scoped** (`*.{flac,mp3}`): an
unfiltered glob bundles every file in the folder, so uncompressed masters parked next to the
deliverables silently inflate the build. Keep masters out of `media/audio/` or leave them as `.wav`,
which `.gitignore` excludes.

`recordings.json` — flat array, one entry per recording:

```json
{
  "id": "string",
  "title": "string",
  "species": "string",
  "tags": ["string"],
  "gainDb": -9.5,
  "audio": "media/audio/xxx.flac",
  "image": "media/images/xxx.jpg"
}
```

`gainDb` (optional, defaults to 0) trims playback level per recording. Field recordings arrive at
very different loudnesses — this catalog spanned 23 LU — and on a kiosk that means a visitor sets a
comfortable volume and the next track is either inaudible or startling. Trimming at playback keeps
the audio files themselves untouched, so levels can be retuned by editing a number instead of
re-encoding.

Because HTML5 audio volume only attenuates (0-1, no boost), **`gainDb` is always ≤ 0 and the shared
target must be the quietest track in the catalog**. A track recorded far below the others can't be
raised this way and has to be corrected at the file level first — as `alicuco-grillos` was, having
been captured 30 dB below full scale.

Catalog is small (<20 recordings) — no search/pagination needed.

Entries with a missing or unloadable audio/image file are skipped at load (console warning only) — the kiosk never shows a broken card.

## Stack

- **Electron** — kiosk fullscreen, no browser chrome, global F4 capture, devtools/right-click/text-selection/pinch-zoom disabled, cursor hidden.
- **React + CSS Modules** — UI.
- **Framer Motion** — state transitions and player animation.
- Fonts bundled locally (no network, so no Google Fonts at runtime).
- UI text: Spanish only.
- Hardware assumption: touchscreen for visitors + physical keyboard attached (F4 and password entry). Fixed landscape resolution — no responsive breakpoints.
- Target OS: **Windows 8**. Electron is pinned to 22.3.27, the last release supporting it — which also covers Windows 7/8.1/10/11 (32- and 64-bit), Linux, and macOS. Do not upgrade Electron past 22; see `README.md` "Target machine".
- No auto-launch, no crash watchdog — staff starts the app manually.
- Admin password hardcoded in source. It's a visitor deterrent, not a real security boundary.

## Long-run stability (old machine, runs all day)

- Animate `transform`/`opacity` only; never layout properties.
- At most one full-bleed animated layer at a time (Idle Ken Burns).
- Images pre-scaled to screen resolution at build time — no multi-MB originals decoded live.
- Reuse a single `<audio>` element; clear timers/listeners on every state exit; no unbounded state growth.

## Out of scope

- No relation to `backend` / `aws_backend` / `frontend` — this only shares the same recordings conceptually.
- No network calls of any kind.
