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
- Target OS: **Debian (x86_64)**, on an old desktop with an integrated GeForce 7025. Electron is pinned to 22.3.27 — originally because of Windows 8, now for the reasons in "Target machine and packaging" below. Do not bump it without reading that section.
- Auto-launch and crash recovery are the OS's job, not the app's: the machine autologins and runs the app in a shell loop that restarts it on any unexpected exit. The app signals a *deliberate* close with exit code 42. See "Session model" below.
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

The kiosk is an **old desktop running Linux**: a Gigabyte GA-M68MT-S2 (AM3) with an AMD
Athlon II, an integrated GeForce 7025, a VGA panel with a USB HID touch layer, and a
mechanical hard disk. It is **fully offline** — no network at the install site, by design.

This replaces an earlier plan to ship to a Windows 8 machine. Nothing in `src/` was
Windows-specific — there is no `win32` code path, no native modules, no serial or GPIO — so
Windows was only ever a packaging target and the `win:` / `mac:` blocks in
`electron-builder.yml` are kept only because they cost nothing.

### The Electron 22 pin

`electron` is pinned to **22.3.27**, exactly, with no caret. **The original reason for that
pin is gone**: it was the last release supporting Windows 8, and there is no Windows 8
machine any more. Do not read this section as saying Windows still constrains the project.

The pin survives on two much weaker legs, and both should be re-examined rather than
inherited:

1. **It is known-good and nothing is pushing on it.** The machine is offline, so an EOL
   Chromium carries no practical risk here, and upgrading is not on the critical path for
   getting the kiosk running.
2. **The CPU may not be able to run anything newer.** The Athlon II is K10: it has SSE4a but
   **not SSE4.1 or SSE4.2**. Chromium's x86-64 baseline has risen over the years, so a modern
   Electron may refuse to start on this hardware (expect `SIGILL`, not a clean error). This is
   unverified and is the first thing to measure on the machine.

Until that measurement exists, three things stay as they are:

- **The exact pin, no `^`.** A caret would let a `bun update` pull a newer Electron and
  silently break the only machine this is for.
- **`electron.vite.config.ts` pins build targets to `chrome108` / `node16`.** Vite 7 targets
  newer browsers by default. Without these, the build succeeds and the kiosk shows a *blank
  window with no error* — the worst possible failure mode to debug on site.
- **Electron 22 is end-of-life** (security patches stopped May 2023). Acceptable *only*
  because the kiosk is offline. Do not reuse this build on an internet-connected machine.

Nothing in the UI depends on a post-Chromium-108 feature — the built bundle was scanned for
newer APIs (`toSorted`, `Object.groupBy`, etc.) and CSS (`@container`, `@layer`), and uses
none. If the Electron upgrade ever happens, it is a self-contained experiment: bump the
version, drop the two Vite target pins, confirm the app launches on the hardware.

### What the hardware dictates

These are constraints of the machine, not preferences, and they explain several choices that
would otherwise look arbitrary:

- **No hardware H.264 decode.** NVIDIA's video decode block (VDPAU) starts at GeForce 8
  (G80); the 7025 predates it. The idle background video is decoded entirely on the CPU. This
  is survivable mainly because `idleVideoPlaybackRate = 0.5` halves the frames decoded per
  wall-second — see "Long-run stability". The video should be encoded at the panel's native
  resolution, not 1080p; decoding pixels that are then thrown away is the most expensive
  avoidable thing this machine does.
- **nouveau is the only driver.** NVIDIA's 304.xx legacy branch, the last to support GeForce
  7, has not worked with a current X server in a decade. nouveau on NV4x is Mesa's old
  `nouveau_vieux` path: OpenGL 2.1, no usable GLES2, no reclocking.
- **Therefore X11, not Wayland.** A single-app Wayland compositor such as `cage` would be a
  neater fit for a kiosk, but wlroots requires GLES2, which this driver does not provide.
- **RAM matters more than disk.** The whole of `media/` is ~194MB, so with 4GB installed it
  stays in the page cache after the first play and the hard disk goes idle. With 2GB — the
  integrated GPU also carves 128–256MB out of system RAM — it gets evicted and re-read from
  a spinning disk on every loop, which is audible. An SSD is not needed; 4GB is.
- **Fixed landscape, touch only.** Unchanged from the original design. The panel's native
  resolution is what the image prescaler and the video encoder target.

### Session model

The app does not run on a desktop. The machine autologins an unprivileged `kiosk` user on
tty1, starts X with `startx -- -nocursor`, runs `openbox` as a minimal window manager, and
then loops:

```
launch app  →  exit code 42  →  show launcher menu  →  relaunch app
            →  any other exit →  relaunch app immediately (crash)
```

Two pieces of this are a contract between the app and the OS config, and neither makes sense
alone:

- **Exit code 42 means "the visitor-facing app was deliberately closed from the admin
  screen".** `ipcMain.on('app:quit')` in `src/main/index.ts` uses `app.exit(42)` rather than
  `app.quit()` so the code actually reaches the shell. Any other exit status is treated as a
  crash and the app is restarted silently.
- **The launcher menu is therefore already PIN-gated.** It is only reachable through the
  existing F4-or-corner-hold → `ADMIN_PIN` gate in `state/AppShell.tsx`; a crash never
  exposes it. (After several consecutive crashes the loop does fall through to the menu — at
  that point the kiosk is already broken and an escape hatch is worth more than the gate.)

A window manager is **required**, not decorative: `kiosk: true` / `fullscreen: true` work by
asking the WM for `_NET_WM_STATE_FULLSCREEN`. With no WM running, the window silently appears
at its requested 1280×720 and the fullscreen request does nothing.

The launcher menu itself is a small Tk script outside Electron, offering four large touch
targets: *Voces de la extinción* (relaunch), *Reiniciar*, *Apagar*, and *Terminal*. A second
Electron instance would match the app's look but costs ~100MB of RAM and several seconds of
startup on this CPU.

The OS-side configuration — autologin drop-in, `.xinitrc`, the menu script, the openbox
config, and the polkit rule letting `kiosk` power the machine off — lives in `kiosk/` in this
repo, deliberately **outside** the `.deb`: the package is reinstalled on every app update and
must not clobber system configuration each time.

### Build targets

```bash
bun run build:linux     # deb — the museum deliverable
bun run build:win       # zip + NSIS; kept only in case a Windows machine reappears
bun run build:mac
```

`bun run build:linux` produces `dist/player-interface-<version>-amd64.deb`, which installs to
`/opt/player-interface/` — the path the `.xinitrc` loop expects. Install it from a USB stick
with `apt`, not `dpkg -i`, so dependencies resolve:

```bash
sudo apt install ./player-interface-<version>-amd64.deb
```

That is the whole deployment story. There is no updater and no network install path; the
machine is offline and a new build arrives on a USB stick.

### Before trusting a fresh install

The app has **never been run on this hardware**, and several things below are measurements,
not assumptions. `CHECKLIST.md` carries the on-site list; the hardware-specific gates are:

1. The panel's native resolution (`xrandr`) — feeds the image prescaler and the video encode.
2. That the touch layer enumerates (`libinput list-devices`) and reports sane coordinates.
3. That the video plays at 0.5× without pegging a core.
4. Whether a modern Electron launches at all, which settles the pin question above.
5. Debian's `kernel.apparmor_restrict_unprivileged_userns` — if set, it breaks Chromium's
   namespace sandbox and surfaces as a SUID-sandbox error at launch. Prefer shipping an
   AppArmor profile over `--no-sandbox`.
