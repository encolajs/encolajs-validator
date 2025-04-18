import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import PathResolver from '../PathResolver'

/**
 * @fileoverview Rule that makes a field required if another field is empty
 */

/**
 * Makes a field required if another field is empty
 */
export class RequiredWithoutRule extends ValidationRule {
  /**
   * Validates that the field is required if another field is empty
   * @param value - The value to validate
   * @param path - The path being validated
   * @param data - The data source
   * @returns Whether the value is valid
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
        'RequiredWithoutRule requires a parameter referencing another field path using @'
      )
    }

    // Get the actual field path without @
    const fieldPath = PathResolver.resolveReferencePath(otherPath, path)

    if (fieldPath === null) {
      return true
    }

    // Get the value of the other field
    const otherValue = this.resolveParameter(fieldPath, data)

    // If the other field is empty, this field is required
    const isOtherFieldEmpty = isEmpty(otherValue)

    if (isOtherFieldEmpty) {
      // This field is now required
      return !isEmpty(value)
    }

    // Otherwise, validation passes regardless of this field's value
    return true
  }
}
