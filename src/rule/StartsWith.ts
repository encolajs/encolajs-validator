import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class StartsWithRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    const stringValue = String(value)

    const substring = this.parameters?.[0]
    if (!substring) {
      throw new Error('StartsWithRule requires a substring parameter')
    }

    const resolvedSubstring = String(this.resolveParameter(substring, data))

    return stringValue.startsWith(resolvedSubstring)
  }
}
