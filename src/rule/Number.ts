import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { isNumber } from '../util/isNumber'

export class NumberRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value, false, false)) {
      return true
    }

    return isNumber(value)
  }
}
