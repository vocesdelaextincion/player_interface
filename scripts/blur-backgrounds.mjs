#!/usr/bin/env node
// Bakes the blurred variant of each carousel background that the Active screen fades in while a
// station is sounding. Doing it here rather than with a CSS filter is deliberate: full-bleed
// blur is per-frame GPU work the kiosk can't spare, and DESIGN.md allows only transform and
// opacity to animate. A pre-blurred layer is just an opacity crossfade.
//
// The variants are written small on purpose — blur destroys the detail that resolution buys, so
// they upscale invisibly at a fraction of the decode cost and file size.
//
// Usage: node scripts/blur-backgrounds.mjs [dir=media/backgrounds]

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const WORKING_WIDTH = 480
const BLUR_SIGMA = 12
const JPEG_QUALITY = 72

const SOURCE = /^(left|right)_menu(\d+)\.jpg$/i

const dir = process.argv[2] ?? 'media/backgrounds'

if (!existsSync(dir)) {
  console.error(`Directory not found: ${dir}`)
  process.exit(1)
}

const files = readdirSync(dir).filter((name) => SOURCE.test(name))

if (files.length === 0) {
  console.warn(`No carousel backgrounds found in ${dir}`)
  process.exit(0)
}

for (const file of files) {
  const dest = join(dir, file.replace(/\.jpg$/i, '.blur.jpg'))

  execFileSync('magick', [
    join(dir, file),
    '-resize',
    `${WORKING_WIDTH}x`,
    '-blur',
    `0x${BLUR_SIGMA}`,
    '-quality',
    String(JPEG_QUALITY),
    dest
  ])

  console.log(`${file} -> ${dest}`)
}
