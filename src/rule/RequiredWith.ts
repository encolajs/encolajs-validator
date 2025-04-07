import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import PathResolver from '../PathResolver'

/**
 * Makes a field required if another field has a value
 */
export class RequiredWithRule extends ValidationRule {
  /**
   * Validates that the field is required if another field has a value
   */
  validate(value: any, path: string, data: object): boolean {
    // Get the path of the other field
    const otherPath = this.parameters?.[0]
    if (
      !otherPath ||
      typeof otherPath !== 'string' ||
      !otherPath.startsWith('@')
    ) {
      throw new Error(
        'RequiredWithRule requires a parameter referencing another field path using @'
      )
    }

    // Get the actual field path without @
    const fieldPath = PathResolver.resolveReferencePath(otherPath, path)

    if (fieldPath === null) {
      return true
    }

    // Get the value of the other field
    const otherValue = this.resolveParameter(fieldPath, data)

    // If the other field has a value, this field is required
    const isOtherFieldPopulated = !isEmpty(otherValue)

    if (isOtherFieldPopulated) {
      // This field is now required
      return !isEmpty(value)
    }

    // Otherwise, validation passes regardless of this field's value
    return true
  }
}
