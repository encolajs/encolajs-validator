import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'
import { isInteger } from '../util/isNumber'

export class IntegerRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    if (isEmpty(value, false, false)) {
      return true
    }

    return isInteger(value)
  }
}
