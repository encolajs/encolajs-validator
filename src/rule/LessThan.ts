import { NumberComparisonRule } from './NumberComparisonRule'

export class LessThanRule extends NumberComparisonRule {
  protected compare(a: number, b: number): boolean {
    return a < b
  }
}
