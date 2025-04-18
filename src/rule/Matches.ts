import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class MatchesRule extends ValidationRule {
  protected getRegex(data: object): RegExp {
    // Get the regex pattern
    const pattern = this.parameters?.[0]
    if (!pattern) {
      throw new Error(
        'MatchesRule requires a regular expression pattern parameter'
      )
    }

    try {
      // Create a RegExp object from the pattern
      return new RegExp(pattern)
    } catch (error) {
      throw new Error(
        `Invalid regular expression pattern: ${(error as Error).message}`
      )
    }
  }

  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    const stringValue = String(value)

    const regex = this.getRegex(data)
    return regex.test(stringValue)
  }
}
