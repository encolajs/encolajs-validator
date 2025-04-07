import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { isInteger } from '../util/isNumber'

export class IntegerRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value, false, false)) {
      return true
    }

    return isInteger(value)
  }
}
