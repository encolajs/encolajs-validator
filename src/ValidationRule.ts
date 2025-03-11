import { DataSourceInterface } from './datasource/DataSourceInterface'

/**
 * Base class for all validation rules
 */
export abstract class ValidationRule {
  /** Validation rule parameters */
  public parameters?: any[]

  constructor(parameters?: any[]) {
    this.parameters = parameters
  }

  abstract validate(
    value: any,
    path: string,
    datasource: DataSourceInterface
  ): boolean | Promise<boolean>

  resolveParameter(param: any, datasource?: DataSourceInterface): any {
    if (typeof param !== 'string' || !param.startsWith('@') || !datasource) {
      return param
    }

    const fieldPath = param.substring(1)

    return datasource.getValue(fieldPath)
  }
}
