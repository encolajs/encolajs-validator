import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class DateAfter extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Parse the date to validate
    const valueDate = new Date(value)
    if (isNaN(valueDate.getTime())) {
      return false
    }

    // Get the comparison date
    const compareValue = this.parameters?.[0]
    if (!compareValue) {
      throw new Error('AfterDateRule requires a date to compare against')
    }

    // Handle field reference or direct date string
    const resolvedCompareValue = this.resolveParameter(compareValue, data)

    let compareDate: Date

    if (resolvedCompareValue === 'now') {
      compareDate = new Date()
    } else {
      compareDate = new Date(resolvedCompareValue)
      if (isNaN(compareDate.getTime())) {
        throw new Error('AfterDateRule comparison value is not a valid date')
      }
    }

    // Check if valueDate is after compareDate
    return valueDate.getTime() > compareDate.getTime()
  }
}
