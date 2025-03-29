import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'
import { isEmpty } from '../util/isEmpty'

export class InListRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    if (isEmpty(value)) {
      return true
    }

    if (!this.parameters || this.parameters.length === 0) {
      throw new Error(
        'InListRule requires at least one allowed value parameter'
      )
    }
    const parameters = this.parameters.map((param) => {
      return String(this.resolveParameter(param, datasource))
    })

    return parameters.includes(String(value))
  }
}
