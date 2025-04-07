import { MatchesRule } from './Matches'

export class SlugRule extends MatchesRule {
  protected getRegex(data: object): RegExp {
    return /^[a-zA-Z0-9_-]+$/
  }
}
