import PathResolver from '../PathResolver'
export default function getValue(path: string, data: any): any {
  if (!path) return data

  const segments = PathResolver.splitPath(path)
  let current: any = data

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined
    }

    // Handle numeric segments as array indices
    if (/^\d+$/.test(segment)) {
      const index = parseInt(segment, 10)

      if (
        !Array.isArray(current) ||
        isNaN(index) ||
        index < 0 ||
        index >= current.length
      ) {
        return undefined
      }

      current = current[index]
    } else {
      // Handle object property access
      if (typeof current !== 'object') {
        return undefined
      }

      current = current[segment]
    }
  }

  return current
}
