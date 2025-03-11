import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

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
   * @param datasource - The data source
   * @returns Whether the value is valid
   */
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
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
    const fieldPath = otherPath.substring(1)

    // Get the value of the other field
    const otherValue = datasource.getValue(fieldPath)

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
