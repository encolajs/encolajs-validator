import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'
import PathResolver from '../PathResolver'
import convertToBoolean from '../util/convertToBoolean'

/**
 * Makes a field required unless another field equals a specific value
 */
export class RequiredUnlessRule extends ValidationRule {
  /**
   * Validates that the field is required unless another field equals a specific value
   * @param value - The value to validate
   * @param path - The path being validated
   * @param datasource - The data source
   * @returns Whether the value is valid
   */
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    // Get the parameters
    const otherPath = this.parameters?.[0]
    const expectedValue = convertToBoolean(this.parameters?.[1])

    if (
      !otherPath ||
      typeof otherPath !== 'string' ||
      !otherPath.startsWith('@')
    ) {
      throw new Error(
        'RequiredUnlessRule requires a parameter referencing another field path using @'
      )
    }

    // Get the actual field path without @
    const fieldPath = PathResolver.resolveReferencePath(otherPath, path)

    if (fieldPath === null) {
      return true
    }

    // Resolve the expected value (could be a reference to another field)
    const resolvedExpectedValue = convertToBoolean(
      this.resolveParameter(fieldPath, datasource)
    )

    // Check if the other field matches the expected value
    // Use loose comparison to handle cases like "1" == 1
    const matches = expectedValue == resolvedExpectedValue

    if (!matches) {
      // This field is required when other field doesn't match the expected value
      return !isEmpty(value)
    }

    // Otherwise, validation passes regardless of this field's value
    return true
  }
}
