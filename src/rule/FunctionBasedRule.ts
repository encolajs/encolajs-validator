import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

/**
 * Type for validation functions
 */
export type ValidationFunction = (
  value: any,
  path?: string,
  datasource?: DataSourceInterface
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
   * @param value - The value to validate
   * @param path - The path being validated
   * @param datasource - The data source
   * @returns Whether the value is valid
   */
  validate(
    value: any,
    path: string,
    datasource: DataSourceInterface
  ): boolean | Promise<boolean> {
    if (isEmpty(value)) {
      return true
    }

    // Extract parameters as an array for the validation function
    const params: any[] = []
    if (this.parameters) {
      // Extract parameters in order (param1, param2, etc.)
      for (let i = 0; i < this.parameters.length; i++) {
        params.push(this.resolveParameter(this.parameters[i], datasource))
      }
    }

    // Call the validation function with the resolved parameters
    return this.validationFn.call({ params }, value, path, datasource)
  }
}
