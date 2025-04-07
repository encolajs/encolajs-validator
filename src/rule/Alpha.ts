import { MatchesRule } from './Matches'

export class AlphaRule extends MatchesRule {
  protected getRegex(data: object): RegExp {
    return /^[a-zA-Z]+$/
  }
}
