import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

export class MaxLengthRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    // Skip validation if the value is empty
    if (isEmpty(value)) {
      return true
    }

    const stringValue = String(value)

    const maxLength = this.parameters?.[0]
    if (maxLength === undefined) {
      throw new Error('MaxLengthRule requires a maximum length parameter')
    }

    return stringValue.length <= parseInt(maxLength)
  }
}
