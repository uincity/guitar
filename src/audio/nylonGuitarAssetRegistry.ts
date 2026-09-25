import manifest from './nylon-guitar/sample-map.generated.json'
import { normalizeSamplePath, toBuildSamplePath } from './samplePath'

const encodePath = (fileKey: string) => normalizeSamplePath(fileKey).split('/').map(encodeURIComponent).join('/')
const assetRoot = import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}@nylon-guitar/`
  : `${import.meta.env.BASE_URL}assets/nylon-guitar/`

export const nylonGuitarAssets: ReadonlyMap<string, string> = new Map(
  [...new Set(manifest.map(({ fileKey }) => normalizeSamplePath(fileKey)))]
    .map((fileKey) => [fileKey, `${assetRoot}${encodePath(import.meta.env.DEV ? fileKey : toBuildSamplePath(fileKey))}`]),
)

export const getNylonGuitarAssetUrl = (fileKey: string) => nylonGuitarAssets.get(normalizeSamplePath(fileKey))
