# player_interface

Museum kiosk player for Voces de la Extinción. See `directive.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `STAGES.md`.

## Setup

Needs Node 22 LTS on `PATH` when installing (`.nvmrc` / `.node-version` pin this) — electron's installer
silently corrupts its own binary extraction under some newer Node versions (confirmed broken on v26, no
error raised). If `bun run dev` fails with `Error: Electron uninstall`, that's this: run
`node_modules/electron/install.js` with Node 22 to re-extract, or fix your PATH so `node` resolves to 22
before running `bun install`.

```bash
bun install
```

## Development

```bash
bun run dev
```

Dev mode opens a normal, resizable window. Packaged builds run fullscreen/kiosk (see `ARCHITECTURE.md`).

## Target machine

**Windows 10 x64 or newer.** This is a hard floor, not a preference:

- Electron 39 supports Windows 10 and up only. Support for **Windows 7 / 8 / 8.1 was dropped in
  Electron 23** (which moved to Chromium 110); Electron 22 was the last version to support them, and
  its own support ended May 2023. On Windows 8 or 7 the packaged app will not start at all.
- Electron 39 publishes **x64 and arm64 Windows binaries only — no 32-bit (ia32)**. A Windows 7/8-era
  machine has a real chance of being 32-bit, so confirm this alongside the OS version.

Confirm the kiosk's Windows version, architecture, and screen resolution before the first install.
Resolution matters because the layout is fixed landscape (`ARCHITECTURE.md`) and the image prescaler
needs a target size.

### If the machine turns out to be Windows 7/8/8.1 or 32-bit

The app has to drop to **Electron 22** — the last release that runs there. That is an EOL build
receiving no security patches, which is tolerable only because this kiosk has no network access at
all. Required changes:

1. `electron` → `^22.3.27` in `devDependencies`; `electron-vite` and `electron-builder` down to
   versions compatible with it.
2. Pin the renderer build target to Chromium 108 in `electron.vite.config.ts`
   (`build: { target: 'chrome108' }`) — Vite otherwise emits syntax that Electron 22 can't parse.
3. Add `ia32` back to `win.target[].arch` in `electron-builder.yml` if the machine is 32-bit.

Nothing in the UI relies on a post-Chromium-108 feature, so the app code itself should carry over
unchanged — but this path is **untested** and needs a real run on the target hardware.

## Build

```bash
bun run build:win:zip   # zip only — works on Linux/macOS, no wine needed
bun run build:win       # zip + NSIS installer — needs Windows or wine
bun run build:mac
bun run build:linux
```

`bun run build:win:zip` produces `dist/player-interface-<version>-win.zip`. Unpack it on the kiosk and
run `player-interface.exe` — no installer and no admin rights. This is the intended deployment.

The NSIS installer (`build:win`) shells out to wine when built off-Windows. **Without wine it fails
partway and still leaves a ~300KB `setup.exe` in `dist/` that looks like a real artifact but is a
broken stub** — delete it rather than shipping it.
