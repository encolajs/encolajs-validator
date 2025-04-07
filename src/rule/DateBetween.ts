import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class DateBetweenRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Parse the date to validate
    const valueDate = new Date(value)
    if (isNaN(valueDate.getTime())) {
      return false
    }

    // Get the minimum date
    const minValue = this.parameters?.[0]
    if (!minValue) {
      throw new Error('DateBetweenRule requires a minimum date')
    }

    // Get the maximum date
    const maxValue = this.parameters?.[1]
    if (!maxValue) {
      throw new Error('DateBetweenRule requires a maximum date')
    }

    // Handle field reference or direct date string for min date
    const resolvedMinValue = this.resolveParameter(minValue, data)

    let minDate: Date

    if (resolvedMinValue === 'now') {
      minDate = new Date()
    } else {
      minDate = new Date(resolvedMinValue)
      if (isNaN(minDate.getTime())) {
        throw new Error('DateBetweenRule minimum date is not valid')
      }
    }

    // Handle field reference or direct date string for max date
    const resolvedMaxValue = this.resolveParameter(maxValue, data)

    let maxDate: Date

    if (resolvedMaxValue === 'now') {
      maxDate = new Date()
    } else {
      maxDate = new Date(resolvedMaxValue)
      if (isNaN(maxDate.getTime())) {
        throw new Error('DateBetweenRule maximum date is not valid')
      }
    }

    // Check if valueDate is between minDate and maxDate (inclusive)
    const valueTime = valueDate.getTime()
    return valueTime >= minDate.getTime() && valueTime <= maxDate.getTime()
  }
}
