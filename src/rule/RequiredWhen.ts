import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

/**
 * Makes a field required when another field equals a specific value
 */
export class RequiredWhenRule extends ValidationRule {
  /**
   * Validates that the field is required when another field equals a specific value
   * @param value - The value to validate
   * @param path - The path being validated
   * @param datasource - The data source
   * @returns Whether the value is valid
   */
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    // Get the parameters
    const otherPath = this.parameters?.[0]
    const expectedValue = this.parameters?.[1]

    if (
      !otherPath ||
      typeof otherPath !== 'string' ||
      !otherPath.startsWith('@')
    ) {
      throw new Error(
        'RequiredWhenRule requires a parameter referencing another field path using @'
      )
    }

    // Get the actual field path without @
    const fieldPath = otherPath.substring(1)

    // Get the value of the other field
    const otherValue = datasource.getValue(fieldPath)

    // Resolve the expected value (could be a reference to another field)
    const resolvedExpectedValue = this.resolveParameter(
      expectedValue,
      datasource
    )

    // Check if the other field matches the expected value
    // Use loose comparison to handle cases like "1" == 1
    const matches = otherValue == resolvedExpectedValue

    if (matches) {
      // This field is now required
      return !isEmpty(value)
    }

    // Otherwise, validation passes regardless of this field's value
    return true
  }
}
