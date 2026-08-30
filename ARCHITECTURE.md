# Architecture

## States

- **Idle** — silent, slowed video, default resting screen. The clip plays at reduced speed and loops; where there is more than one, each fades through black into another picked at random, indefinitely. Footage sits behind a dimming veil with one line of instruction ("Toca la pantalla para comenzar") bottom-centred. No audio. Any touch → Recommendations.
- **Recommendations** — one screen of usage notes over the blurred exhibit photograph. Takes no input; holds 5s and moves on by itself. It exists because Active deliberately says nothing until a sound is playing: the icons carry no titles, and combining them is not something a visitor would try unprompted.
- **Active** — a carousel of station screens, each holding 4 recordings as play/stop icons. The background's filename decides which side the icons sit on. Tap an icon to start that recording; tap it again to stop it. Sounds layer freely and loop until stopped, so a station is a mix rather than a playlist. The recording most recently started is named in the opposite column, and the whole photograph softens while anything is sounding. No touch for 45s **and** nothing playing → back to Idle. **90s after Active appears → Farewell, unconditionally.**
- **Farewell** — the end of a capped visit. Takes no input; holds 6s → Idle.
- **Admin** — password-gated, opened by F4 or by a 3s press in the bottom-left corner, from any state. Opening the prompt stops playback. The PIN is entered on an on-screen keypad. Wrong PIN: shake feedback, stay on prompt. Esc or _Volver_ cancels back to previous state. Actions: Close app, Restart app, Lock.
- **Locked** — freezes all touch input (screen-cleaning mode). The frame swallows touches but cannot stop the shell's window-level listeners, which is what keeps the corner press working. Unlocked the same way it was entered → returns to Idle.

```
Idle          --touch-->      Recommendations
Recommendations --5s-->       Active
Active        --45s idle-->   Idle
Active        --90s always--> Farewell
Farewell      --6s-->         Idle
any           --gate-->       Admin
Admin         --Close-->      (quit)
Admin         --Restart-->    app.relaunch() + exit
Admin         --Lock-->       Locked
Locked        --gate-->       Idle
```

`--gate-->` is F4 **or** a 3s press in the bottom-left corner, then the PIN. The kiosk ships without a keyboard, so the touch path is the primary one and F4 is the convenience.

## Playback

- Sounds layer: every recording on the current station owns its own `<audio>` element, and any number of them can sound at once.
- Each one loops until stopped. Stop rewinds — with a mix there is no position worth keeping, so there is no pause and no scrub bar.
- Turning the page tears down the outgoing station's elements, which stops everything on it.
- Four concurrent decodes is the ceiling the kiosk has to hold, and the one thing here that can only be confirmed on the hardware — see `CHECKLIST.md`.

## Content

No backend, no internet. Audio, images, and video are bundled in the repo.

```
media/
  audio/                 *.flac (*.mp3 also accepted)
  backgrounds/           *.jpg   — Active screens, 1920x1080
  backgrounds/           *.blur.jpg — baked blurs, generated, small on purpose
  videos/                *.mp4   — idle footage, 1080p, no audio track
content/
  recordings.json
```

`media/` holds **only what the app loads** — 194MB against the 943MB it carried when masters lived
alongside the deliverables. Camera masters and full-res originals moved to `../media-archive/`,
which nothing in the build reads; the scripts that consume them all take a path argument. See that
folder's README for the regeneration commands.

Note this does not shrink the git repository: the masters are still in its history, and moving them
only cleans the working tree.

Background filenames are load-bearing: `left_menu2.jpg` means "on this screen, put the recording
menu on the left". The pattern is `(left|right)_menu<n>.jpg`; anything else (`admin_menu.jpg`) is
skipped by the carousel. Left and right sets are interleaved so the menu alternates sides on every
page turn rather than staying put for four screens.

Each screen also has a baked blur, `left_menu2.blur.jpg`, produced by `bun run blur-backgrounds`
and paired to its sharp twin by that name. Active crossfades it in on `opacity` while a station is
sounding. A CSS filter would be the obvious way to do this and is the wrong one: full-bleed blur is
per-frame GPU work the kiosk can't spare, and animating a blur radius breaks the transform/opacity
rule below. The variants are written at 480px wide because blur destroys the detail resolution
buys — they upscale invisibly at a fraction of the decode cost. A missing blur warns and the screen
simply never softens.

Idle footage is bundled by a separate glob and is **not** part of `recordings.json` — clips aren't
tied to recordings. Source material comes off the camera at 4K and tens of Mbps, which a
kiosk-grade machine cannot decode; deliverables are 1080p H.264 with the audio stream stripped,
produced by `bun run encode-idle-video <master> [--start s] [--end s]`. The masters live in
`videos/masters/`, one level below the non-recursive glob, so they stay in the repo without
reaching the build.

The catalog is currently **one clip**, `voces_background.mp4` — 1:50 cut out of a three-minute
master, played at half speed, so a loop lasts about 3:40 on screen. With one clip Idle loops it on
the video element itself rather than cycling: the fade-through-black machinery only engages with
two or more, and looping natively avoids a visible hitch at the seam. Drop more clips into
`media/videos/` and the random cycle comes back on its own.

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
  "audio": "media/audio/xxx.flac"
}
```

There is no per-recording image. The Active redesign left nothing that renders one — a station is
a photograph with unlabelled icons on it, and the label that appears names the recording in words.
The field outlived its use and was worse than dead weight: a missing image silently dropped the
whole recording from the catalog.

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

Entries with a missing or unloadable audio file are skipped at load (console warning only) — the kiosk never shows a control that plays nothing.

## Stack

- **Electron** — kiosk fullscreen, no browser chrome, global F4 capture, devtools/right-click/text-selection/pinch-zoom disabled, cursor hidden.
- **React + CSS Modules** — UI.
- **Framer Motion** — state transitions and player animation.
- Fonts bundled locally (no network, so no Google Fonts at runtime).
- UI text: Spanish only.
- Hardware assumption: touchscreen only. Nothing in the app — visitor or staff — requires a keyboard. F4 and typed digits still work where one happens to be plugged in, but they are never the only way through a screen. Fixed landscape resolution — no responsive breakpoints.
- Target OS: **Windows 8**. Electron is pinned to 22.3.27, the last release supporting it — which also covers Windows 7/8.1/10/11 (32- and 64-bit), Linux, and macOS. Do not upgrade Electron past 22; see "Target machine and packaging" below.
- No auto-launch, no crash watchdog — staff starts the app manually.
- Admin PIN hardcoded in source, digits only so the on-screen keypad can enter it. A visitor deterrent, not a real security boundary.

## Long-run stability (old machine, runs all day)

- Animate `transform`/`opacity` only; never layout properties.
- At most one full-bleed animated layer at a time. Idle's clip changes fade a single video element out and back rather than cross-fading two, so there is never more than one decode in flight — the heaviest constraint on this machine.
- Images pre-scaled to screen resolution at build time — no multi-MB originals decoded live.
- One `<audio>` element per sound on the _current_ station only, built and torn down with it — never one per recording in the catalog. Clear timers/listeners on every state exit; no unbounded state growth.

## Out of scope

- No relation to `backend` / `aws_backend` / `frontend` — this only shares the same recordings conceptually.
- No network calls of any kind.

## Target machine and packaging

The kiosk runs **Windows 8**, so this project is pinned to **Electron 22.3.27** — the last Electron
release that supports Windows 8. Electron 23 moved to Chromium 110 and dropped Windows 7/8/8.1
entirely; on anything newer than 22, the app does not start on that machine at all.

That pin is load-bearing. Three things follow from it, and none of them should be "tidied up":

1. **`electron` is pinned exactly (`22.3.27`, no `^`).** A caret would let a `bun update` pull
   Electron 23+ and silently break the only machine this is for.
2. **`electron.vite.config.ts` pins build targets to `chrome108` / `node16`.** Vite 7 targets newer
   browsers by default. Without these, the build succeeds and the kiosk shows a *blank window with no
   error* — the worst possible failure mode to debug on site.
3. **Electron 22 is end-of-life** (security patches stopped May 2023). This is acceptable *only*
   because the kiosk is fully offline by design — no network calls of any kind. Do not reuse this
   build on an internet-connected machine.

Pinning to 22 costs nothing in reach — it is the widest-compatibility choice available:

| Platform | Support |
|---|---|
| Windows 7 / 8 / 8.1 | Yes — the reason for the pin |
| Windows 10 / 11 | Yes, both 32- and 64-bit |
| Linux | Yes (AppImage, x64) |
| macOS | Yes (10.11+) |

Still worth confirming on site: whether the machine is 32- or 64-bit, and its screen resolution. If
nobody can check the architecture, **ship the `ia32` build** — 32-bit Windows binaries run fine on
64-bit Windows, so it is the safe default. Resolution matters because the layout is fixed landscape
and the image prescaler needs a target size.

Nothing in the UI depends on a post-Chromium-108 feature — the built bundle was scanned for newer
APIs (`toSorted`, `Object.groupBy`, etc.) and CSS (`@container`, `@layer`), and uses none. It has
**not** yet been run on real Windows 8 hardware.

### Build targets

```bash
bun run build:win:zip   # zip, x64 + ia32 — works on Linux/macOS, no wine needed
bun run build:win       # zip + NSIS installer — needs Windows or wine
bun run build:linux     # AppImage
bun run build:mac
```

`bun run build:win:zip` produces both architectures:

```
dist/player-interface-<version>-win.zip        # 64-bit
dist/player-interface-<version>-ia32-win.zip   # 32-bit — the safe default if unsure
```

Unpack one on the kiosk and run `player-interface.exe` — no installer and no admin rights. This is the
intended deployment.

The NSIS installer (`build:win`) shells out to wine when built off-Windows. **Without wine it fails
partway and still leaves a ~300KB `setup.exe` in `dist/` that looks like a real artifact but is a
broken stub** — delete it rather than shipping it.
