import rawRecordings from '../../../../content/recordings.json'

export interface Recording {
  id: string
  title: string
  species: string
  tags: string[]
  audioSrc: string
  imageSrc: string
}

interface RawRecording {
  id: string
  title: string
  species: string
  tags: string[]
  audio: string
  image: string
}

// Eager: the catalog is small (<20) and this only runs once, at startup.
// Extension-scoped on purpose: an unfiltered glob bundles *everything* sitting in the folder,
// so leaving uncompressed masters next to the deliverables silently inflates the build.
const audioFiles = import.meta.glob('../../../../media/audio/*.{flac,mp3}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

const imageFiles = import.meta.glob('../../../../media/images/*', {
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
    const imageSrc = resolveAsset(imageFiles, raw.image.replace(/^media\//, ''))

    if (!audioSrc || !imageSrc) {
      console.warn(
        `[recordings] skipping "${raw.id}" — missing ${!audioSrc ? raw.audio : raw.image}`
      )
      continue
    }

    recordings.push({
      id: raw.id,
      title: raw.title,
      species: raw.species,
      tags: raw.tags,
      audioSrc,
      imageSrc
    })
  }

  return recordings
}

export const recordings = loadRecordings()
