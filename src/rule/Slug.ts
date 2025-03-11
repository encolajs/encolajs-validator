import { MatchesRule } from './Matches'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class SlugRule extends MatchesRule {
  protected getRegex(datasource: DataSourceInterface): RegExp {
    return /^[a-zA-Z0-9_-]+$/
  }
}
