import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { isNumber, toNumber } from '../util/isNumber'

const missingValueError: string = 'Validator requires a comparison value'
/**
 * Base class for number comparison validation rules
 */
export abstract class NumberComparisonRule extends ValidationRule {
  /**
   * Compare two numeric values
   * @param a - First value
   * @param b - Second value
   * @returns Whether the comparison is valid
   */
  protected abstract compare(a: number, b: number): boolean

  validate(value: any, path: string, data: object): boolean {
    // Skip validation if the value is empty (unless required is also specified)
    if (isEmpty(value, false, false)) {
      return true
    }

    // Check if the value is a valid number
    if (!isNumber(value)) {
      return false
    }

    // Get the comparison value
    const comparisonValue = this.parameters?.[0]
    if (comparisonValue === undefined) {
      throw new Error(missingValueError)
    }

    // Convert comparison value to number
    let resolvedComparisonValue: any

    // Check if it's a reference to another field
    if (
      typeof comparisonValue === 'string' &&
      comparisonValue.startsWith('@')
    ) {
      resolvedComparisonValue = this.resolveParameter(comparisonValue, data)

      // Check if the resolved value is a valid number
      if (!isNumber(resolvedComparisonValue)) {
        throw new Error(`Validator requires a valid number for comparison`)
      }
    } else {
      resolvedComparisonValue = comparisonValue

      // Check if the comparison value is a valid number
      if (!isNumber(resolvedComparisonValue)) {
        throw new Error(`Validator requires a valid number for comparison`)
      }
    }

    // Convert both values to numbers for comparison
    const numericValue = toNumber(value)
    const numericComparisonValue = toNumber(resolvedComparisonValue)

    // Compare the values using the subclass's compare method
    return this.compare(numericValue, numericComparisonValue)
  }
}
