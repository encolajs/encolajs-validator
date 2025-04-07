import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class ArrayMaxLengthRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value, false, false)) {
      return true
    }

    if (!Array.isArray(value)) {
      return false
    }

    const maxLength = this.parameters?.[0]
    if (maxLength === undefined) {
      throw new Error('ArrayMaxLengthRule requires a maximum length parameter')
    }

    const parsedMaxLength = parseInt(maxLength, 10)
    if (isNaN(parsedMaxLength) || parsedMaxLength < 0) {
      throw new Error(
        'ArrayMaxLengthRule maximum length must be a non-negative integer'
      )
    }

    return value.length <= parsedMaxLength
  }
}
