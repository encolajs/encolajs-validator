import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { parseDate } from '../util/dateParser'

export class DateBetweenRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Get the start and end dates and format
    const startValue = this.parameters?.[0]
    const endValue = this.parameters?.[1]
    const format = this.parameters?.[2] || 'yyyy-mm-dd'

    if (!startValue || !endValue) {
      throw new Error('DateBetweenRule requires both start and end dates')
    }

    // Handle field references or direct date strings
    const resolvedStartValue = this.resolveParameter(startValue, data)
    const resolvedEndValue = this.resolveParameter(endValue, data)

    // Parse start date
    let startDate: Date
    if (resolvedStartValue === 'now') {
      startDate = new Date()
    } else {
      // First try with the provided format
      let parsedStartDate = parseDate(resolvedStartValue, format)

      // If that fails, try with the default format
      if (!parsedStartDate.isValid && format) {
        parsedStartDate = parseDate(resolvedStartValue, 'yyyy-mm-dd')
      }

      if (!parsedStartDate.isValid) {
        throw new Error('DateBetweenRule start date is not valid')
      }
      startDate = parsedStartDate.date!
    }

    // Parse end date
    let endDate: Date
    if (resolvedEndValue === 'now') {
      endDate = new Date()
    } else {
      // First try with the provided format
      let parsedEndDate = parseDate(resolvedEndValue, format)

      // If that fails, try with the default format
      if (!parsedEndDate.isValid && format) {
        parsedEndDate = parseDate(resolvedEndValue, 'yyyy-mm-dd')
      }

      if (!parsedEndDate.isValid) {
        throw new Error('DateBetweenRule end date is not valid')
      }
      endDate = parsedEndDate.date!
    }

    // Parse the date to validate
    let parsedValue = parseDate(value, format)

    // If that fails, try with the default format
    if (!parsedValue.isValid && format) {
      parsedValue = parseDate(value, 'yy-mm-dd')
    }

    if (!parsedValue.isValid) {
      return false
    }

    const valueDate = parsedValue.date!
    return (
      valueDate.getTime() >= startDate.getTime() &&
      valueDate.getTime() <= endDate.getTime()
    )
  }
}
