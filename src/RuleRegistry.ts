import { ValidationRule } from './ValidationRule'

export type RuleFactory = (params: string[]) => ValidationRule

/**
 * Registry for validation rules
 */
export class RuleRegistry {
  /** Map of rule names to their factories */
  private _factories: Map<string, RuleFactory> = new Map()

  /** Map of rule names to their default error messages */
  private _defaultMessages: Map<string, string> = new Map()

  /**
   * Register a validation rule
   * @param name - Rule name
   * @param factory - Rule factory function
   * @param defaultMessage - Default error message for the rule
   * @returns This registry instance
   */
  register(
    name: string,
    factory: RuleFactory,
    defaultMessage: string
  ): RuleRegistry {
    if (typeof factory !== 'function') {
      throw new Error('Rule factory must be a function')
    }

    this._factories.set(name, factory)
    this._defaultMessages.set(name, defaultMessage)

    return this
  }

  /**
   * Get a validation rule instance
   * @param name - Rule name
   * @param params - Parameters for the rule
   * @returns A validation rule instance or undefined if not found
   */
  get(name: string, params: string[]): ValidationRule | undefined {
    const factory = this._factories.get(name)
    if (!factory) return undefined

    return factory(params)
  }

  /**
   * Check if a rule is registered
   * @param name - Rule name
   * @returns Whether the rule is registered
   */
  has(name: string): boolean {
    return this._factories.has(name)
  }

  /**
   * Get the default error message for a rule
   * @param name - Rule name
   * @returns The default error message or undefined if not found
   */
  getDefaultMessage(name: string): string | undefined {
    return this._defaultMessages.get(name)
  }
}
