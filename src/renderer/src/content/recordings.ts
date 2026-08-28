import rawRecordings from '../../../../content/recordings.json'

export interface Recording {
  id: string
  title: string
  species: string
  tags: string[]
  /** Linear playback volume, 0-1. Derived from `gainDb`. */
  gain: number
  audioSrc: string
}

interface RawRecording {
  id: string
  title: string
  species: string
  tags: string[]
  gainDb?: number
  audio: string
}

// The catalog's tracks were recorded at wildly different levels (a 23 LU spread), which on a
// kiosk means a visitor sets a comfortable volume and the next track is inaudible or startling.
// `gainDb` trims each one to a common loudness at playback, leaving the files themselves
// untouched. HTML5 audio volume can only attenuate, so gainDb is always <= 0 and the shared
// target has to be the quietest track — see ARCHITECTURE.md "Content".
function toLinearGain(gainDb: number | undefined): number {
  if (gainDb === undefined) return 1
  return Math.min(1, Math.max(0, 10 ** (gainDb / 20)))
}

// Eager: the catalog is small (<20) and this only runs once, at startup.
// Extension-scoped on purpose: an unfiltered glob bundles *everything* sitting in the folder,
// so leaving uncompressed masters next to the deliverables silently inflates the build.
const audioFiles = import.meta.glob('../../../../media/audio/*.{flac,mp3}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

function resolveAsset(files: Record<string, string>, relativePath: string): string | undefined {
  const key = Object.keys(files).find((path) => path.endsWith(relativePath))
  return key ? files[key] : undefined
}

function loadRecordings(): Recording[] {
  const recordings: Recording[] = []

  for (const raw of rawRecordings as RawRecording[]) {
    const audioSrc = resolveAsset(audioFiles, raw.audio.replace(/^media\//, ''))

    if (!audioSrc) {
      console.warn(`[recordings] skipping "${raw.id}" — missing ${raw.audio}`)
      continue
    }

    recordings.push({
      id: raw.id,
      title: raw.title,
      species: raw.species,
      tags: raw.tags,
      gain: toLinearGain(raw.gainDb),
      audioSrc
    })
  }

  return recordings
}

export const recordings = loadRecordings()
