import { MatchesRule } from './Matches'

export class UrlRule extends MatchesRule {
  protected getRegex(data: object): RegExp {
    return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  }
}
