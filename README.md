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

## Build

```bash
bun run build:win
bun run build:mac
bun run build:linux
```
