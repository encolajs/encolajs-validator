import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { parseDate } from '../util/dateParser'

export class DateBeforeRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Get the comparison date and format
    const compareValue = this.parameters?.[0]
    const format = this.parameters?.[1]

    if (!compareValue) {
      throw new Error('BeforeDateRule requires a date to compare against')
    }

    // Handle field reference or direct date string
    const resolvedCompareValue = this.resolveParameter(compareValue, data)

    let compareDate: Date

    if (resolvedCompareValue === 'now') {
      compareDate = new Date()
    } else {
      const parsedCompareDate = parseDate(resolvedCompareValue, format)
      if (!parsedCompareDate.isValid) {
        throw new Error('BeforeDateRule comparison value is not a valid date')
      }
      compareDate = parsedCompareDate.date!
    }

    // Parse the date to validate
    const parsedValue = parseDate(value, format)
    if (!parsedValue.isValid) {
      return false
    }

    // Check if valueDate is before compareDate
    return parsedValue.date!.getTime() < compareDate.getTime()
  }
}
