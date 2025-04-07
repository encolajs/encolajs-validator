import { getValueFn } from './types'
import getValue from './util/getValue'

/**
 * Base class for all validation rules
 */
export abstract class ValidationRule {
  /** Validation rule parameters */
  public parameters?: any[]
  public getValueFn: getValueFn

  constructor(parameters?: any[]) {
    this.parameters = parameters
    this.getValueFn = getValue
  }

  abstract validate(
    value: any,
    path: string,
    data: object
  ): boolean | Promise<boolean>

  resolveParameter(param: any, data?: object): any {
    if (typeof param !== 'string' || !param.startsWith('@') || !data) {
      return param
    }

    const fieldPath = param.substring(1)

    return this.getValueFn(fieldPath, data)
  }
}
