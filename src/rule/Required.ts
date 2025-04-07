import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class RequiredRule extends ValidationRule {
  validate(value: any, path?: string, data?: object): boolean {
    return !isEmpty(value)
  }
}
