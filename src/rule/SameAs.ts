import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class SameAsRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Get the comparison value
    const comparisonValue = this.parameters?.[0]
    if (comparisonValue === undefined) {
      throw new Error('SameAsRule requires a comparison value parameter')
    }

    // Resolve the comparison value (could be a reference to another field)
    const resolvedComparisonValue = this.resolveParameter(comparisonValue, data)

    // Compare the values using loose equality (==) to handle type coercion
    // This allows comparing "5" with 5 as requested
    return value == resolvedComparisonValue
  }
}
