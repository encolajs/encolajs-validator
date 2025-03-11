import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

export class DateFormatRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    if (isEmpty(value)) {
      return true
    }

    const format = this.parameters?.[0] || 'YYYY-MM-DD'

    const strValue = String(value)

    const date = new Date(strValue)

    if (isNaN(date.getTime())) {
      return false
    }

    // Advanced format validation based on the specified format
    const formatRegexMap: Record<string, RegExp> = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
      'MM-DD-YYYY': /^\d{2}-\d{2}-\d{4}$/,
      'DD-MM-YYYY': /^\d{2}-\d{2}-\d{4}$/,
    }

    const regex = formatRegexMap[format]
    if (!regex) {
      return true // If format is not in our map, just validate it's a valid date
    }

    return regex.test(strValue)
  }
}
