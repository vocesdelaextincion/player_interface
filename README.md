# player_interface

Museum kiosk player for Voces de la Extinción. See `directive.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `STAGES.md`.

## Setup

Needs Node 22 LTS on `PATH` when installing (`.nvmrc` / `.node-version` pin this) — electron's installer
silently corrupts its own binary extraction under some newer Node versions (confirmed broken on v26, no
error raised).

```bash
bun install
```

If `bun run dev` fails with `Error: Electron uninstall`, that's the extraction bug. Either fix your
`PATH` so `node` resolves to 22 and reinstall, or re-extract without Node involved at all:

```bash
bun install --ignore-scripts
bun node_modules/electron/install.js   # bun runs it, so Node's version stops mattering
```

The second form is what to use on a machine stuck on Node 26 — it's how the current Electron 22
binary in this repo was extracted.

## Development

```bash
bun run dev
```

Dev mode opens a normal, resizable window. Packaged builds run fullscreen/kiosk (see `ARCHITECTURE.md`).

## Target machine

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
   because the kiosk is fully offline by design — no network calls of any kind (`ARCHITECTURE.md`).
   Do not reuse this build on an internet-connected machine.

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
(`ARCHITECTURE.md`) and the image prescaler needs a target size.

Nothing in the UI depends on a post-Chromium-108 feature — the built bundle was scanned for newer
APIs (`toSorted`, `Object.groupBy`, etc.) and CSS (`@container`, `@layer`), and uses none. It has
**not** yet been run on real Windows 8 hardware.

## Build

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
