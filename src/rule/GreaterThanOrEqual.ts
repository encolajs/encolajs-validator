import { NumberComparisonRule } from './NumberComparisonRule'

export class GreaterThanOrEqualRule extends NumberComparisonRule {
  protected compare(a: number, b: number): boolean {
    return a >= b
  }
}
