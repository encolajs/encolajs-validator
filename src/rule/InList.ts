import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'

export class InListRule extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    if (!this.parameters || this.parameters.length === 0) {
      throw new Error(
        'InListRule requires at least one allowed value parameter'
      )
    }
    const parameters = this.parameters.map((param) => {
      return String(this.resolveParameter(param, data))
    })

    return parameters.includes(String(value))
  }
}
