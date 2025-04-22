import { parse, isValid } from 'date-fns'

export interface DateParseResult {
  isValid: boolean
  date: Date | null
}

export function parseDate(
  value: string | Date,
  format?: string
): DateParseResult {
  // If value is already a Date object, return it directly
  if (value instanceof Date) {
    return {
      isValid: !isNaN(value.getTime()),
      date: !isNaN(value.getTime()) ? value : null,
    }
  }

  if (!format) {
    const date = new Date(value)
    return {
      isValid: !isNaN(date.getTime()),
      date: !isNaN(date.getTime()) ? date : null,
    }
  }

  const formatMap: Record<string, string> = {
    // New JS-style formats
    'yy-mm-dd': 'yy-MM-dd',
    'mm/dd/yy': 'MM/dd/yy',
    'dd/mm/yy': 'dd/MM/yy',
    'yy/mm/dd': 'yy/MM/dd',
    'mm-dd-yy': 'MM-dd-yy',
    'dd-mm-yy': 'dd-MM-yy',
    // Legacy YYYY formats
    'yyyy-mm-dd': 'yyyy-MM-dd',
    'mm/dd/yyyy': 'MM/dd/yyyy',
    'dd/mm/yyyy': 'dd/MM/yyyy',
    'yyyy/mm/dd': 'yyyy/MM/dd',
    'mm-dd-yyyy': 'MM-dd-yyyy',
    'dd-mm-yyyy': 'dd-MM-yyyy',
  }

  // Handle legacy format names
  const legacyFormatMap: Record<string, string> = {
    'YYYY-MM-DD': 'yyyy-mm-dd',
    'MM/DD/YYYY': 'mm/dd/yyyy',
    'DD/MM/YYYY': 'dd/mm/yyyy',
    'YYYY/MM/DD': 'yyyy/mm/dd',
    'MM-DD-YYYY': 'mm-dd-yyyy',
    'DD-MM-YYYY': 'dd-mm-yyyy',
  }

  let normalizedFormat = format.toLowerCase()
  if (legacyFormatMap[format]) {
    normalizedFormat = legacyFormatMap[format]
  }

  const dateFnsFormat = formatMap[normalizedFormat] || normalizedFormat

  // Parse the date using date-fns and validate it
  let parsedDate: Date
  try {
    parsedDate = parse(value, dateFnsFormat, new Date())
  } catch (error) {
    // If there's an error parsing the date (e.g., invalid format), return invalid result
    return {
      isValid: false,
      date: null,
    }
  }

  if (!isValid(parsedDate)) {
    return {
      isValid: false,
      date: null,
    }
  }

  // Create a new Date with the same year, month, and day, but with time set to midnight UTC
  const normalizedDate = new Date(
    Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    )
  )

  return {
    isValid: true,
    date: normalizedDate,
  }
}
