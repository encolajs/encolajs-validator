import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class RequiredRule extends ValidationRule {
  validate(
    value: any,
    path?: string,
    datasource?: DataSourceInterface
  ): boolean {
    return !isEmpty(value)
  }
}
