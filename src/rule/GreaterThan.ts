import { NumberComparisonRule } from './NumberComparisonRule'

export class GreaterThanRule extends NumberComparisonRule {
  protected compare(a: number, b: number): boolean {
    return a > b
  }
}
