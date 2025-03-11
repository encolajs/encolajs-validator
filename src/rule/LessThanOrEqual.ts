import { NumberComparisonRule } from './NumberComparisonRule'

export class LessThanOrEqualRule extends NumberComparisonRule {
  protected compare(a: number, b: number): boolean {
    return a <= b
  }
}
