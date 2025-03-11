import { MatchesRule } from './Matches'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class UrlRule extends MatchesRule {
  protected getRegex(datasource: DataSourceInterface): RegExp {
    return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  }
}
