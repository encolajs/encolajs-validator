import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { parseDate } from '../util/dateParser'

export class DateFormatRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // If value is a Date object, it's always valid
    if (value instanceof Date && !isNaN(value.getTime())) {
      return true
    }

    if (!this.parameters?.[0]) {
      this.parameters = ['yyyy-mm-dd']
    }

    const format = this.parameters[0]
    const strValue = String(value)

    // Use the new dateParser utility
    const result = parseDate(strValue, format)
    return result.isValid
  }
}
