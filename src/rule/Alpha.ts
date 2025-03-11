import { MatchesRule } from './Matches'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class AlphaRule extends MatchesRule {
  protected getRegex(datasource: DataSourceInterface): RegExp {
    return /^[a-zA-Z]+$/
  }
}
