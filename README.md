# player_interface

Museum kiosk player for Voces de la Extinción. See `directive.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `STAGES.md`.

## Setup

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
