import { MatchesRule } from './Matches'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class EmailRule extends MatchesRule {
  protected getRegex(datasource: DataSourceInterface): RegExp {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  }
}
