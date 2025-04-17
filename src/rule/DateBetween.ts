import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { parseDate } from '../util/dateParser'

export class DateBetweenRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Get the minimum date, maximum date and format
    const minValue = this.parameters?.[0]
    const maxValue = this.parameters?.[1]
    const format = this.parameters?.[2]

    if (!minValue) {
      throw new Error('DateBetweenRule requires a minimum date')
    }

    if (!maxValue) {
      throw new Error('DateBetweenRule requires a maximum date')
    }

    // Handle field reference or direct date string for min date
    const resolvedMinValue = this.resolveParameter(minValue, data)

    let minDate: Date

    if (resolvedMinValue === 'now') {
      minDate = new Date()
    } else {
      const parsedMinDate = parseDate(resolvedMinValue, format)
      if (!parsedMinDate.isValid) {
        throw new Error('DateBetweenRule minimum date is not valid')
      }
      minDate = parsedMinDate.date!
    }

    // Handle field reference or direct date string for max date
    const resolvedMaxValue = this.resolveParameter(maxValue, data)

    let maxDate: Date

    if (resolvedMaxValue === 'now') {
      maxDate = new Date()
    } else {
      const parsedMaxDate = parseDate(resolvedMaxValue, format)
      if (!parsedMaxDate.isValid) {
        throw new Error('DateBetweenRule maximum date is not valid')
      }
      maxDate = parsedMaxDate.date!
    }

    // Parse the date to validate
    const parsedValue = parseDate(value, format)
    if (!parsedValue.isValid) {
      return false
    }

    // Check if valueDate is between minDate and maxDate (inclusive)
    const valueTime = parsedValue.date!.getTime()
    return valueTime >= minDate.getTime() && valueTime <= maxDate.getTime()
  }
}
