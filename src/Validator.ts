import PathResolver from './PathResolver'
import { ValidationRule } from './ValidationRule'
import { RuleRegistry } from './RuleRegistry'
import {
  messageFormatter,
  ValidatorOptions,
  CustomMessagesConfig,
} from './types'
import { DataSourceInterface } from './datasource/DataSourceInterface'

export interface NamedRule {
  name: string
  rule: ValidationRule
}

export class Validator {
  private _rules: Record<string, NamedRule[]> = {}
  private _errors: Record<string, string[]> = {}
  private _serverErrors: Record<string, string> = {}
  private _messageFormatter: messageFormatter
  private _ruleRegistry: RuleRegistry
  private _customMessages: CustomMessagesConfig
  private _dependents: Record<string, Set<string>> = {}

  constructor(ruleRegistry: RuleRegistry, options: ValidatorOptions = {}) {
    this._ruleRegistry = ruleRegistry
    this._messageFormatter =
      options.messageFormatter || this._defaultMessageFormatter
    this._customMessages = options.customMessages || {}
  }

  private _defaultMessageFormatter(
    ruleName: string,
    value: any,
    path: string,
    validationRule: ValidationRule
  ): string {
    const defaultMessage =
      this._ruleRegistry.getDefaultMessage(ruleName) || 'Validation failed'

    const customMessageKey = `${path}:${ruleName}`
    let message = this._customMessages[customMessageKey] || defaultMessage

    message = message.replace(
      /{value}/g,
      String(value === undefined ? 'undefined' : value)
    )

    message = message.replace(/{param:(\w+)}/g, (match, paramName) => {
      const paramValue = validationRule.parameters?.[paramName]

      if (typeof paramValue === 'string' && paramValue.startsWith('@')) {
        return paramValue.substring(1)
      }

      return String(paramValue || '')
    })

    message = message.replace(/{field}/g, path)

    return message
  }

  setMessageFormatter(messageFormatter: messageFormatter): Validator {
    this._messageFormatter = messageFormatter
    return this
  }

  setCustomMessages(customMessages: CustomMessagesConfig): Validator {
    this._customMessages = { ...this._customMessages, ...customMessages }
    return this
  }

  setRules(rules: Record<string, string | NamedRule[]>): Validator {
    this._rules = this._parseRulesConfig(rules)
    this._buildDependencyMap()
    return this
  }

  private _parseRulesConfig(
    rulesConfig: Record<string, string | NamedRule[]>
  ): Record<string, NamedRule[]> {
    if (!rulesConfig || typeof rulesConfig !== 'object') {
      return {}
    }

    const parsedRules: Record<string, NamedRule[]> = {}

    for (const [path, rules] of Object.entries(rulesConfig)) {
      if (Array.isArray(rules)) {
        if (rules.length > 0 && 'name' in rules[0] && 'rule' in rules[0]) {
          parsedRules[path] = rules as NamedRule[]
        } else {
          console.warn(
            `ValidationRules without names provided for path ${path}. These rules will be skipped.`
          )
        }
      } else if (typeof rules === 'string') {
        parsedRules[path] = this._parseRuleString(rules)
      } else {
        console.warn(`Invalid rules for path ${path}`)
      }
    }

    return parsedRules
  }

  private _parseRuleString(ruleString: string): NamedRule[] {
    if (!ruleString || typeof ruleString !== 'string') {
      return []
    }

    const ruleStrings = ruleString.split('|')
    const rules: NamedRule[] = []

    for (const rule of ruleStrings) {
      if (!rule.trim()) continue

      const parts = rule.split(':')
      const ruleName = parts[0].trim()
      const paramStr = parts.slice(1).join(':')

      const paramArray: string[] = []
      if (paramStr) {
        let currentParam = ''
        let inReference = false

        for (let i = 0; i < paramStr.length; i++) {
          const char = paramStr[i]

          if (char === '@') {
            inReference = true
            currentParam += char
          } else if (char === ',' && !inReference) {
            paramArray.push(currentParam.trim())
            currentParam = ''
          } else {
            currentParam += char

            if (inReference && (char === ' ' || i === paramStr.length - 1)) {
              inReference = false
            }
          }
        }

        if (currentParam) {
          paramArray.push(currentParam.trim())
        }
      }

      const validationRule = this._ruleRegistry.get(ruleName, paramArray)
      if (!validationRule) {
        console.warn(`Unknown rule: ${ruleName}`)
        continue
      }

      rules.push({
        name: ruleName,
        rule: validationRule,
      })
    }

    return rules
  }

  private _buildDependencyMap(): void {
    this._dependents = {}

    for (const [path, namedRules] of Object.entries(this._rules)) {
      for (const { rule } of namedRules) {
        if (!rule.parameters) continue

        for (const paramValue of rule.parameters) {
          if (typeof paramValue === 'string' && paramValue.startsWith('@')) {
            const referencedField = paramValue.substring(1)

            if (!this._dependents[referencedField]) {
              this._dependents[referencedField] = new Set()
            }
            this._dependents[referencedField].add(path)
          }
        }
      }
    }
  }

  getDependentFields(path: string): string[] {
    return [...(this._dependents[path] || [])]
  }

  async validatePath(
    path: string,
    dataSource: DataSourceInterface
  ): Promise<boolean> {
    if (!path) return true

    delete this._errors[path]

    let namedRules = this._rules[path] || []

    for (const [rulePath, ruleSet] of Object.entries(this._rules)) {
      if (PathResolver.matchesPattern(path, rulePath) && rulePath !== path) {
        namedRules = [...namedRules, ...ruleSet]
      }
    }

    if (namedRules.length === 0) return true

    const value = dataSource.getValue(path)

    const errors: string[] = []

    for (const { name, rule } of namedRules) {
      try {
        const isValid = await rule.validate(value, path, dataSource)

        if (!isValid) {
          const errorMessage = this._messageFormatter(name, value, path, rule)
          errors.push(errorMessage)
          break
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Validation error in rule ${name}`

        errors.push(errorMessage)
        break
      }
    }

    if (errors.length > 0) {
      this._errors[path] = errors
      return false
    }

    return true
  }

  async validatePattern(
    pattern: string,
    dataSource: DataSourceInterface
  ): Promise<boolean> {
    if (!pattern) return true

    const paths = this._findMatchingPaths(pattern, '', dataSource.getRawData())

    const results = await Promise.all(
      paths.map((path) => this.validatePath(path, dataSource))
    )

    return results.every((result) => result)
  }

  private _findMatchingPaths(
    pattern: string,
    currentPath: string = '',
    currentData: any = null
  ): string[] {
    const data = currentData
    const result: string[] = []

    if (data === null || data === undefined || typeof data !== 'object') {
      if (PathResolver.matchesPattern(currentPath, pattern)) {
        result.push(currentPath)
      }
      return result
    }

    if (currentPath && PathResolver.matchesPattern(currentPath, pattern)) {
      result.push(currentPath)
    }

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const nextPath = currentPath ? `${currentPath}.${i}` : `.${i}`
        result.push(...this._findMatchingPaths(pattern, nextPath, data[i]))
      }
    } else {
      for (const key of Object.keys(data)) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key
        result.push(...this._findMatchingPaths(pattern, nextPath, data[key]))
      }
    }

    return result
  }

  async validateGroup(
    dataSource: DataSourceInterface,
    ...paths: string[]
  ): Promise<boolean> {
    if (paths.length === 0) return true

    const results = await Promise.all(
      paths.map((path) => this.validatePath(path, dataSource))
    )

    return results.every((result) => result)
  }

  async validate(dataSource: DataSourceInterface): Promise<boolean> {
    const promises = Object.keys(this._rules).map((path) =>
      path.includes('*')
        ? this.validatePattern(path, dataSource)
        : this.validatePath(path, dataSource)
    )

    const results = await Promise.all(promises)
    return results.every((result) => result)
  }

  reset(): Validator {
    this._errors = {}
    this._serverErrors = {}
    return this
  }

  getErrors(): Record<string, string[]> {
    const errors = { ...this._errors }

    for (const [path, message] of Object.entries(this._serverErrors)) {
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(message)
    }

    return errors
  }

  getErrorsForPath(path: string): string[] {
    const errors = [...(this._errors[path] || [])]
    if (this._serverErrors[path]) {
      errors.push(this._serverErrors[path])
    }
    return errors
  }

  setServerErrors(errors: Record<string, string>): Validator {
    this._serverErrors = { ...errors }
    return this
  }

  clearServerErrors(): Validator {
    this._serverErrors = {}
    return this
  }

  removeServerError(path: string): Validator {
    delete this._serverErrors[path]
    return this
  }

  clearErrorsForPath(path: string): Validator {
    delete this._errors[path]
    delete this._serverErrors[path]
    return this
  }

  clearErrorsForPattern(pattern: string): Validator {
    for (const path of Object.keys(this._errors)) {
      if (PathResolver.matchesPattern(path, pattern)) {
        delete this._errors[path]
      }
    }

    for (const path of Object.keys(this._serverErrors)) {
      if (PathResolver.matchesPattern(path, pattern)) {
        delete this._serverErrors[path]
      }
    }

    return this
  }

  hasErrors(): boolean {
    return (
      Object.keys(this._errors).length > 0 ||
      Object.keys(this._serverErrors).length > 0
    )
  }

  hasErrorsForPath(path: string): boolean {
    return !!(this._errors[path] || this._serverErrors[path])
  }
}
