import { MatchesRule } from './Matches'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class AlphaNumericRule extends MatchesRule {
  protected getRegex(datasource: DataSourceInterface): RegExp {
    return /^[a-zA-Z0-9]+$/
  }
}
