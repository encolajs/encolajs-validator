/**
 * Check if a value is empty
 * @param value - The value to check
 * @param includeEmptyObjects - Consider empty objects to be considered empty value
 * @param includeEmptyArrays - Consider empty arrays to be considered empty value
 * @returns Whether the value is empty
 */
export function isEmpty(
  value: any,
  includeEmptyObjects: boolean = true,
  includeEmptyArrays: boolean = true
): boolean {
  // Null or undefined
  if (value === null || value === undefined) {
    return true
  }

  // Empty string
  if (typeof value === 'string' && value.trim() === '') {
    return true
  }

  // Empty array
  if (includeEmptyArrays && Array.isArray(value) && value.length === 0) {
    return true
  }

  // Empty object (no own enumerable properties)
  if (
    includeEmptyObjects &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.toString() === '[object Object]' &&
    Object.keys(value).length === 0
  ) {
    return true
  }

  // NaN is considered empty
  if (typeof value === 'number' && isNaN(value)) {
    return true
  }

  // Non-empty value
  return false
}
