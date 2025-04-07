import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class PasswordRule extends ValidationRule {
  public parameters = [8, 32]
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    value = String(value)

    // Get min and max character parameters
    const minChars = this.parameters?.[0]
      ? parseInt(String(this.parameters[0]), 10)
      : 8 // Default min 8
    const maxChars = this.parameters?.[1]
      ? parseInt(String(this.parameters[1]), 10)
      : 32 // Default max 32

    // Check for invalid parameters
    if (
      isNaN(minChars) ||
      isNaN(maxChars) ||
      minChars < 1 ||
      maxChars < minChars
    ) {
      throw new Error(
        'PasswordRule requires valid min_characters and max_characters parameters'
      )
    }

    if (value.length < minChars || value.length > maxChars) {
      return false
    }

    if (!/[A-Z]/.test(value)) {
      return false
    }

    if (!/[0-9]/.test(value)) {
      return false
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return false
    }

    return true
  }
}
