#!/usr/bin/env node
// Resizes source photos down to kiosk screen resolution before they go into media/images/.
// Keeps full-res originals out of the repo — decoding multi-MB images live is a stability risk
// on the target machine (see ARCHITECTURE.md "Long-run stability").
//
// Usage: node scripts/prescale-images.mjs <sourceDir> [outputDir=media/images]

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const TARGET_LONG_EDGE = 1920 // update once the real kiosk display resolution is confirmed
const JPEG_QUALITY = 85
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])

const [, , sourceDirArg, outputDirArg] = process.argv
if (!sourceDirArg) {
  console.error('Usage: node scripts/prescale-images.mjs <sourceDir> [outputDir=media/images]')
  process.exit(1)
}

const outputDir = outputDirArg ?? 'media/images'

if (!existsSync(sourceDirArg)) {
  console.error(`Source directory not found: ${sourceDirArg}`)
  process.exit(1)
}

mkdirSync(outputDir, { recursive: true })

const files = readdirSync(sourceDirArg).filter((name) =>
  EXTENSIONS.has(extname(name).toLowerCase())
)

if (files.length === 0) {
  console.warn(`No images found in ${sourceDirArg}`)
  process.exit(0)
}

for (const file of files) {
  const src = join(sourceDirArg, file)
  const dest = join(outputDir, file.replace(/\.png$/i, '.jpg'))

  execFileSync('magick', [
    src,
    '-auto-orient',
    '-resize',
    `${TARGET_LONG_EDGE}x${TARGET_LONG_EDGE}>`,
    '-quality',
    String(JPEG_QUALITY),
    dest
  ])

  console.log(`${file} -> ${dest}`)
}
