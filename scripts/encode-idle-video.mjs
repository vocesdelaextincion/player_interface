#!/usr/bin/env node
// Turns a camera master into an idle-screen deliverable: trimmed, scaled to 1080p, audio stripped.
//
// The kiosk cannot decode what comes off the camera — 4K at tens of Mbps — and Idle is the screen
// it sits on all day, so this is the heaviest thing the app ever does (see ARCHITECTURE.md
// "Long-run stability"). Masters stay in media/videos/masters/, one level below the non-recursive
// glob, so they live in the repo without reaching the build.
//
// Audio is dropped rather than muted: Idle is silent by contract, and a stream nothing plays is
// only weight.
//
// Usage: node scripts/encode-idle-video.mjs <source> [options]
//   --out <path>     default media/videos/<source name>.mp4
//   --start <sec>    trim this much off the head
//   --end <sec>      trim this much off the tail
//   --crf <n>        quality, lower is bigger (default 21)

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

const TARGET_HEIGHT = 1080
const MAX_BITRATE = '8M' // caps peaks so an old decoder isn't handed a spike
const BUFSIZE = '16M'

const args = process.argv.slice(2)
const source = args[0]

const flags = new Map()
for (let i = 1; i < args.length; i += 2) {
  if (args[i]?.startsWith('--')) flags.set(args[i].slice(2), args[i + 1])
}

if (!source || source.startsWith('--')) {
  console.error(
    'Usage: node scripts/encode-idle-video.mjs <source> [--out p] [--start s] [--end s] [--crf n]'
  )
  process.exit(1)
}

if (!existsSync(source)) {
  console.error(`Source not found: ${source}`)
  process.exit(1)
}

const start = Number(flags.get('start') ?? 0)
const end = Number(flags.get('end') ?? 0)
const crf = String(flags.get('crf') ?? 21)
const out = flags.get('out') ?? join('media/videos', `${basename(source, extname(source))}.mp4`)

const probe = execFileSync('ffprobe', [
  '-v',
  'error',
  '-show_entries',
  'format=duration',
  '-of',
  'default=noprint_wrappers=1:nokey=1',
  source
])
const sourceDuration = Number(String(probe).trim())
const duration = sourceDuration - start - end

if (!Number.isFinite(duration) || duration <= 0) {
  console.error(`Nothing left after trimming ${start}s + ${end}s from ${sourceDuration}s`)
  process.exit(1)
}

console.log(`${source} ${sourceDuration.toFixed(2)}s -> ${out} ${duration.toFixed(2)}s`)

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-nostats',
    '-ss',
    String(start),
    '-i',
    source,
    '-t',
    String(duration),
    '-an',
    '-vf',
    `scale=-2:${TARGET_HEIGHT}`,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    crf,
    '-maxrate',
    MAX_BITRATE,
    '-bufsize',
    BUFSIZE,
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    out
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] }
)
