import PathResolver from './PathResolver'
import { ValidationRule } from './ValidationRule'
import { RuleRegistry } from './RuleRegistry'
import {
  messageFormatter,
  ValidatorOptions,
  CustomMessagesConfig,
  getValueFn,
} from './types'
import getValue from './util/getValue'
import { defaultMessageFormatter } from './ValidatorFactory'

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
  private _getValueFn: getValueFn
  private _customMessages: CustomMessagesConfig
  private _dependents: Record<string, Set<string>> = {}

  constructor(ruleRegistry: RuleRegistry, options: ValidatorOptions = {}) {
    this._ruleRegistry = ruleRegistry
    this._messageFormatter = options.messageFormatter || defaultMessageFormatter
    this._customMessages = options.customMessages || {}
    this._getValueFn = options.getValueFn || getValue
  }

  setMessageFormatter(messageFormatter: messageFormatter): Validator {
    this._messageFormatter = messageFormatter
    return this
  }

  setValueGetter(getValueFn: getValueFn): Validator {
    this._getValueFn = getValueFn
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

      const paramArray: string[] = paramStr.split(',')

      const validationRule = this._ruleRegistry.get(ruleName, paramArray)
      if (!validationRule) {
        console.warn(`Unknown rule: ${ruleName}`)
        continue
      }
      validationRule.getValueFn = this._getValueFn

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
            if (!this._dependents[path]) {
              this._dependents[path] = new Set()
            }
            this._dependents[path].add(referencedField)
          }
        }
      }
    }
  }

  getDependentFields(path: string): string[] {
    return [...(this._dependents[path] || [])]
  }

  async validatePath(path: string, data: object): Promise<boolean> {
    if (!path) return true

    delete this._errors[path]

    let namedRules = this._rules[path] || []

    for (const [rulePath, ruleSet] of Object.entries(this._rules)) {
      if (PathResolver.matchesPattern(path, rulePath) && rulePath !== path) {
        namedRules = [...namedRules, ...ruleSet]
      }
    }

    if (namedRules.length === 0) return true

    const value = this._getValueFn(path, data)

    const errors: string[] = []

    for (const { name, rule } of namedRules) {
      try {
        const isValid = await rule.validate(value, path, data)

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

  async validatePattern(pattern: string, data: object): Promise<boolean> {
    if (!pattern) return true

    const paths = this._findMatchingPaths(pattern, '', data)

    const results = await Promise.all(
      paths.map((path) => this.validatePath(path, data))
    )

    return results.every((result) => result)
  }

  private _findMatchingPaths(
    pattern: string,
    currentPath: string = '',
    currentData: any = null
  ): string[] {
    const result: string[] = []

    // Get pattern parts and current path parts
    const patternParts = pattern.split('.')
    const currentParts = currentPath ? currentPath.split('.') : []
    const currentDepth = currentParts.length

    // If we're at the final depth of the pattern
    if (currentDepth === patternParts.length) {
      if (PathResolver.matchesPattern(currentPath, pattern)) {
        result.push(currentPath)
      }
      return result
    }

    // Get the next expected part from the pattern
    const nextPatternPart = patternParts[currentDepth]

    // Handle array wildcard
    if (nextPatternPart === '*') {
      const arrayData = Array.isArray(currentData) ? currentData : []
      // Always process array indices even if data is missing
      const length = Math.max(arrayData.length, 1)

      for (let i = 0; i < length; i++) {
        const nextPath = currentPath ? `${currentPath}.${i}` : `${i}`
        const nextData = arrayData[i]
        result.push(...this._findMatchingPaths(pattern, nextPath, nextData))
      }

      return result
    }

    // Handle object properties
    if (nextPatternPart !== '*') {
      // If we have an object, traverse its properties
      if (
        currentData &&
        typeof currentData === 'object' &&
        !Array.isArray(currentData)
      ) {
        // Check if the next pattern part exists in the data
        if (nextPatternPart in currentData) {
          const nextPath = currentPath
            ? `${currentPath}.${nextPatternPart}`
            : nextPatternPart
          result.push(
            ...this._findMatchingPaths(
              pattern,
              nextPath,
              currentData[nextPatternPart]
            )
          )
        } else {
          // Create path even if property doesn't exist
          const nextPath = currentPath
            ? `${currentPath}.${nextPatternPart}`
            : nextPatternPart
          result.push(...this._findMatchingPaths(pattern, nextPath, undefined))
        }
      } else {
        // If we don't have an object but pattern continues, create the path
        const nextPath = currentPath
          ? `${currentPath}.${nextPatternPart}`
          : nextPatternPart
        result.push(...this._findMatchingPaths(pattern, nextPath, undefined))
      }
    }

    return result
  }

  async validateGroup(data: object, ...paths: string[]): Promise<boolean> {
    if (paths.length === 0) return true

    const results = await Promise.all(
      paths.map((path) => this.validatePath(path, data))
    )

    return results.every((result) => result)
  }

  async validate(data: object): Promise<boolean> {
    const promises = Object.keys(this._rules).map((path) =>
      path.includes('*')
        ? this.validatePattern(path, data)
        : this.validatePath(path, data)
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
