/**
 * Check if a value is a valid number
 * @param value - The value to check
 * @returns Whether the value is a valid number
 */
export function isNumber(value: any): boolean {
  // Handle the case where value is already a number
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value)
  }

  // For strings, try to convert to number
  if (typeof value === 'string' || value instanceof String) {
    // Remove whitespace
    const trimmedValue = value.toString().trim()
    // Special handling for empty strings
    if (trimmedValue === '') {
      return false
    }

    // Try to convert to number
    const num = Number(trimmedValue)
    return !isNaN(num) && isFinite(num)
  }

  // For other types, it's not a number
  return false
}

/**
 * Check if a value is a valid integer
 * @param value - The value to check
 * @returns Whether the value is a valid integer
 */
export function isInteger(value: any): boolean {
  // First check if it's a valid number
  if (!isNumber(value)) {
    return false
  }

  // Convert to number and check if it's an integer
  const num = Number(value)
  return Math.floor(num) === num
}

/**
 * Convert a value to a number if possible
 * @param value - The value to convert
 * @returns The converted number or NaN if not a valid number
 */
export function toNumber(value: any): number {
  if (isNumber(value)) {
    return Number(value)
  }
  return NaN
}
