import { MatchesRule } from './Matches'

export class AlphaNumericRule extends MatchesRule {
  protected getRegex(data: object): RegExp {
    return /^[a-zA-Z0-9]+$/
  }
}
