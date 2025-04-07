import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class ArrayMinLengthRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value, false, false)) {
      return true
    }

    if (!Array.isArray(value)) {
      return false
    }

    const minLength = this.parameters?.[0]
    if (minLength === undefined) {
      throw new Error('ArrayMinLengthRule requires a minimum length parameter')
    }

    const parsedMinLength = parseInt(minLength, 10)
    if (isNaN(parsedMinLength) || parsedMinLength < 0) {
      throw new Error(
        'ArrayMinLengthRule minimum length must be a non-negative integer'
      )
    }

    return value.length >= parsedMinLength
  }
}
