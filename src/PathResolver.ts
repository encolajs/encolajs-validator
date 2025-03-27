/**
 * Utility class for handling complex path notation using dot notation for array indices
 */
export default class PathResolver {
  /**
   * Check if a path is valid
   * @param path - The path to check
   */
  static isValidPath(path: string): boolean {
    if (typeof path !== 'string') return false
    // Simple validation - more complex validation could be added
    return path.length > 0
  }

  /**
   * Get the parent path of a given path
   * @param path - The path to get the parent of
   * @returns The parent path or null if there's no parent
   */
  static getParentPath(path: string): string | null {
    if (!this.isValidPath(path)) return null

    // Handle dot notation
    const lastDot = path.lastIndexOf('.')
    if (lastDot !== -1) {
      return path.substring(0, lastDot)
    }

    // No parent (top-level property)
    return null
  }

  /**
   * Extract array information from a path segment
   * @param path - The path to check
   * @returns Object with array path and index, or null if not an array
   */
  static extractArrayInfo(
    path: string
  ): { path: string; index: number | string } | null {
    // Check if the last segment is numeric which would indicate an array index
    const lastDotIndex = path.lastIndexOf('.')
    if (lastDotIndex === -1) return null

    const possibleIndex = path.substring(lastDotIndex + 1)
    const isNumeric = /^\d+$/.test(possibleIndex) || possibleIndex === '*'

    if (isNumeric) {
      return {
        path: path.substring(0, lastDotIndex),
        index: possibleIndex === '*' ? '*' : parseInt(possibleIndex, 10),
      }
    }

    return null
  }

  /**
   * Split a path into segments
   * @param path - The path to split
   * @returns Array of path segments
   */
  static splitPath(path: string): string[] {
    if (!this.isValidPath(path)) return []

    // Split by dots
    return path.split('.')
  }

  /**
   * Join path segments into a path
   * @param segments - The segments to join
   * @returns The joined path
   */
  static joinPath(segments: string[]): string {
    if (!Array.isArray(segments) || segments.length === 0) return ''
    return segments.join('.')
  }

  /**
   * Normalize a path to a standard format
   * @param path - The path to normalize
   * @returns The normalized path
   */
  static normalizePath(path: string): string {
    const segments = this.splitPath(path)
    return this.joinPath(segments)
  }

  /**
   * Check if a path matches a pattern (supports wildcards)
   * @param path - The concrete path to check
   * @param pattern - The pattern to match against
   * @returns Whether the path matches the pattern
   */
  static matchesPattern(path: string, pattern: string): boolean {
    const pathSegments = this.splitPath(path)
    const patternSegments = this.splitPath(pattern)

    // If the pattern has more segments than the path, it can't match
    if (patternSegments.length > pathSegments.length) return false

    // Check each segment for matching
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i]
      const pathSegment = pathSegments[i]

      // Case 1: Direct wildcard segment - '*' matches any segment
      if (patternSegment === '*') {
        continue
      }

      // Case 2: Exact match required
      if (patternSegment !== pathSegment) {
        return false
      }
    }

    // All segments matched
    return true
  }

  /**
   * Converts a bracket notation path to dot notation
   * @param path - The path in bracket notation
   * @returns The path in dot notation
   */
  static bracketToDotNotation(path: string): string {
    if (!path) return path

    // Replace bracket notation with dot notation
    // e.g. items[0].name or items[0][name] becomes items.0.name
    return path.replace(/\[(\w+)\]/g, '.$1')
  }

  /**
   * Converts a dot notation path to bracket notation
   * @param path - The path in dot notation
   * @returns The path in bracket notation
   */
  static dotToBracketNotation(path: string): string {
    if (!path) return path

    const segments = this.splitPath(path)
    let result = segments[0]

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      // If the segment is numeric, use bracket notation
      if (/^\d+$/.test(segment)) {
        result += `[${segment}]`
      } else {
        // Otherwise use dot notation
        result += `.${segment}`
      }
    }

    return result
  }

  static resolveReferencePath(
    referencePath: string,
    currentPath: string
  ): string | null {
    // Remove the @ prefix
    const pathWithoutPrefix = referencePath.substring(1)

    // Split both paths into segments
    const referenceSegments = PathResolver.splitPath(pathWithoutPrefix)
    const currentSegments = PathResolver.splitPath(currentPath)

    // Verify the non-wildcard prefix matches
    const prefixLength = referenceSegments.findIndex(
      (segment) => segment === '*'
    )
    if (prefixLength === -1) {
      // No wildcards, paths should match exactly
      return referenceSegments.join('.')
    }

    // Check that all segments before the first wildcard match exactly
    for (let i = 0; i < prefixLength; i++) {
      if (referenceSegments[i] !== currentSegments[i]) {
        return null
      }
    }

    // For each wildcard (*) in the reference path, find the corresponding index
    // from the current path
    const resolvedSegments = referenceSegments.map((segment, index) => {
      if (segment === '*') {
        // Find the corresponding segment in the current path
        // We need to match array positions, so find where this wildcard is in the
        // reference path's array structure and get the same position from current path
        let arrayIndexCount = 0
        const targetArrayIndexCount = referenceSegments
          .slice(0, index)
          .filter((s) => s === '*').length

        // Find the matching array index in the current path
        for (let i = 0; i < currentSegments.length; i++) {
          if (/^\d+$/.test(currentSegments[i])) {
            if (arrayIndexCount === targetArrayIndexCount) {
              return currentSegments[i]
            }
            arrayIndexCount++
          }
        }
        return segment // Keep as * if no match found
      }
      return segment
    })

    return resolvedSegments.join('.')
  }
}
