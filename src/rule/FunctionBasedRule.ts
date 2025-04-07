import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

/**
 * Type for validation functions
 */
export type ValidationFunction = (
  value: any,
  path?: string,
  data?: object
) => boolean | Promise<boolean>

/**
 * Rule implementation that wraps a validation function
 */
export class FunctionBasedRule extends ValidationRule {
  private validationFn: ValidationFunction

  /**
   * Create a new function-based rule
   * @param validationFn - Validation function
   * @param parameters - Rule parameters
   */
  constructor(validationFn: ValidationFunction, parameters?: any[]) {
    super(parameters)
    this.validationFn = validationFn
  }

  /**
   * Validates a value using the validation function
   */
  validate(value: any, path: string, data: object): boolean | Promise<boolean> {
    if (isEmpty(value)) {
      return true
    }

    // Extract parameters as an array for the validation function
    const params: any[] = []
    if (this.parameters) {
      // Extract parameters in order (param1, param2, etc.)
      for (let i = 0; i < this.parameters.length; i++) {
        params.push(this.resolveParameter(this.parameters[i], data))
      }
    }

    // Call the validation function with the resolved parameters
    return this.validationFn.call({ params }, value, path, data)
  }
}
