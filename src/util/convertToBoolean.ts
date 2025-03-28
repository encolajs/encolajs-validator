export default function convertToBoolean(value: any): boolean | any {
  value = typeof value === 'string' ? value.trim().toLowerCase() : value

  if (value === 'true' || value === '1' || value === 1) {
    return true
  }

  if (
    value === 'false' ||
    value === '0' ||
    value === 0 ||
    value === null ||
    value === undefined
  ) {
    return false
  }

  return value
}
