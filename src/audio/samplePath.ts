export const normalizeSamplePath = (value: string) => {
  const normalized: string[] = []
  for (const part of value.replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') normalized.pop()
    else normalized.push(part)
  }
  return normalized.join('/')
}

export const toBuildSamplePath = (value: string) => normalizeSamplePath(value).replaceAll('#', '-sharp-')
