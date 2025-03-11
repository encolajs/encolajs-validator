import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

export class MinLengthRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    // Skip validation if the value is empty
    if (isEmpty(value)) {
      return true
    }

    const stringValue = String(value)

    const minLength = this.parameters?.[0]
    if (minLength === undefined) {
      throw new Error('MinLengthRule requires a minimum length parameter')
    }

    return stringValue.length >= parseInt(minLength)
  }
}
