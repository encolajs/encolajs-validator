import { RuleRegistry, RuleFactory } from './RuleRegistry'
import { Validator, type NamedRule } from './Validator'
import { DataSourceInterface } from './datasource/DataSourceInterface'
import { messageFormatter, CustomMessagesConfig } from './types'
import { ValidationRule } from './ValidationRule'
import { FunctionBasedRule, ValidationFunction } from './rule/FunctionBasedRule'
import { RequiredRule } from './rule/Required'
import { RequiredWithRule } from './rule/RequiredWith'
import { RequiredWithoutRule } from './rule/RequiredWithout'
import { RequiredWhenRule } from './rule/RequiredWhen'
import { RequiredUnlessRule } from './rule/RequiredUnless'
import { NumberRule } from './rule/Number'
import { IntegerRule } from './rule/Integer'
import { GreaterThanRule } from './rule/GreaterThan'
import { GreaterThanOrEqualRule } from './rule/GreaterThanOrEqual'
import { LessThanRule } from './rule/LessThan'
import { LessThanOrEqualRule } from './rule/LessThanOrEqual'
import { EmailRule } from './rule/Email'
import { UrlRule } from './rule/Url'
import { MatchesRule } from './rule/Matches'
import { AlphaRule } from './rule/Alpha'
import { AlphaNumericRule } from './rule/AlphaNumeric'
import { SlugRule } from './rule/Slug'
import { SameAsRule } from './rule/SameAs'
import { MinLengthRule } from './rule/MinLength'
import { MaxLengthRule } from './rule/MaxLength'
import { ContainsRule } from './rule/Contains'
import { StartsWithRule } from './rule/StartsWith'
import { InListRule } from './rule/InList'
import { PasswordRule } from './rule/Password'
import { ArrayMinLengthRule } from './rule/ArrayMinLength'
import { ArrayMaxLengthRule } from './rule/ArrayMaxLength'
import { DateFormatRule } from './rule/DateFormat'
import { DateAfter } from './rule/DateAfter'
import { DateBeforeRule } from './rule/DateBefore'
import { DateBetweenRule } from './rule/DateBetween'
import { Age } from './rule/Age'

function defaultMessageFormatter(
  ruleName: string,
  value: any,
  path: string,
  validationRule: ValidationRule
): string {
  // Get default message from rule registry
  const defaultMessage =
    this._ruleRegistry.getDefaultMessage(ruleName) || 'Validation failed'

  // Replace {value}
  let message = defaultMessage.replace(
    /{value}/g,
    String(value === undefined ? 'undefined' : value)
  )

  // Replace {param:name} with parameters from rule
  message = message.replace(
    /{param\:(\d+)}/g,
    (match: string, paramName: string) => {
      const paramValue = validationRule.parameters?.[parseInt(paramName)]

      // If parameter is a field reference (starts with @), use the field name without @
      if (typeof paramValue === 'string' && paramValue.startsWith('@')) {
        return paramValue.substring(1) // Return field name without @
      }

      return String(paramValue || '')
    }
  )

  // Replace {field} with the field name
  message = message.replace(/{field}/g, path)

  return message
}

/**
 * Factory for creating validators with pre-configured rules and messages
 */
export class ValidatorFactory {
  /** Rule registry instance */
  private _ruleRegistry: RuleRegistry

  /** Default message formatter */
  private _defaultMessageFormatter: messageFormatter

  /**
   * Create a new validator factory
   * @param messageFormatter - Default message formatter
   */
  constructor(messageFormatter?: messageFormatter) {
    this._ruleRegistry = new RuleRegistry()
    this._defaultMessageFormatter = messageFormatter || defaultMessageFormatter
    this._registerDefaultRules()
  }

  /**
   * Register a validation rule
   * @param name - Rule name
   * @param ruleClassOrValidationFunction - Rule class constructor or factory function
   * @param defaultErrorMessage - Default error message for the rule
   * @returns This factory instance
   */
  register(
    name: string,
    ruleClassOrValidationFunction: any,
    defaultErrorMessage: string
  ): ValidatorFactory {
    // Convert class constructor to factory function if needed
    let factory: RuleFactory

    if (typeof ruleClassOrValidationFunction !== 'function') {
      throw new Error('Rule must be a class constructor or validation function')
    }

    if (
      typeof ruleClassOrValidationFunction === 'function' &&
      /^class\s/.test(
        Function.prototype.toString.call(ruleClassOrValidationFunction)
      )
    ) {
      // It's a class constructor
      factory = (params: string[]) => {
        const rule = new ruleClassOrValidationFunction(params)
        return rule
      }
    } else {
      // It's a validation function, wrap it in FunctionBasedRule
      const validationFunction =
        ruleClassOrValidationFunction as ValidationFunction
      factory = (params: string[]) => {
        const rule = new FunctionBasedRule(validationFunction, params)
        return rule
      }
    }

    // Register with the rule registry
    this._ruleRegistry.register(name, factory, defaultErrorMessage)

    return this
  }

  private _registerDefaultRules(): void {
    this.register('required', RequiredRule, 'This field is required')
    this.register('required_with', RequiredWithRule, 'This field is required')
    this.register(
      'required_without',
      RequiredWithoutRule,
      'This field is required'
    )
    this.register('required_when', RequiredWhenRule, 'This field is required')
    this.register(
      'required_unless',
      RequiredUnlessRule,
      'This field is required'
    )

    // number rules
    this.register('number', NumberRule, 'This field number be a number')
    this.register('integer', IntegerRule, 'This field number be an integer')
    this.register(
      'gt',
      GreaterThanRule,
      'This field number be greater than {param:0}'
    )
    this.register(
      'gte',
      GreaterThanOrEqualRule,
      'This field number be greater than or equal to {param:0}'
    )
    this.register(
      'lt',
      LessThanRule,
      'This field number be less than {param:0}'
    )
    this.register(
      'lte',
      LessThanOrEqualRule,
      'This field number be less than or equal to {param:0}'
    )

    // string rules
    // Register string rules
    this.register(
      'starts_with',
      StartsWithRule,
      'This field must start with "{param:0}"'
    )
    this.register(
      'contains',
      ContainsRule,
      'This field must contain "{param:0}"'
    )
    this.register(
      'email',
      EmailRule,
      'This field must be a valid email address'
    )
    this.register('url', UrlRule, 'This field must be a valid URL')
    this.register('matches', MatchesRule, 'This field format is invalid')
    this.register(
      'min_length',
      MinLengthRule,
      'This field must have at least {param:0} characters'
    )
    this.register(
      'max_length',
      MaxLengthRule,
      'This field must not have more than {param:0} characters'
    )
    this.register('alpha', AlphaRule, 'This field may only contain letters')
    this.register(
      'alpha_numeric',
      AlphaNumericRule,
      'This field may only contain letters and numbers'
    )
    this.register(
      'slug',
      SlugRule,
      'This field may only contain letters, numbers, dashes and underscores'
    )

    // array rules
    this.register(
      'array_min',
      ArrayMinLengthRule,
      'This section must have at least {param:0} items'
    )
    this.register(
      'array_max',
      ArrayMaxLengthRule,
      'This section must have at les than {param:0} items'
    )

    // date rules
    this.register(
      'date',
      DateFormatRule,
      'This field must be a valid date in the format {param:0}'
    )
    this.register(
      'date_after',
      DateAfter,
      'This field must be a date after {param:0}'
    )
    this.register(
      'date_before',
      DateBeforeRule,
      'This field must be a date before {param:0}'
    )
    this.register(
      'date_before',
      DateBetweenRule,
      'This field must be a date between {param:0} and {param:1}'
    )
    this.register(
      'age',
      Age,
      'This field must represent a person of at least {param:0} years of age'
    )

    // other rules
    this.register(
      'same_as',
      SameAsRule,
      'This field must be the same as {param:0}'
    )
    this.register('in_list', InListRule, 'This field has not an accepted value')
    this.register(
      'password',
      PasswordRule,
      'This must be between {param:0} and {param:1} characters and include uppercase, number, and special characters'
    )
  }

  /**
   * Create a new validator
   * @param dataSource - Data source
   * @param rules - Validation rules
   * @param customMessages - Custom error messages
   * @returns A new validator instance
   */
  make(
    rules: Record<string, string | NamedRule[]>,
    customMessages?: CustomMessagesConfig
  ): Validator {
    // Create a new validator with our rule registry
    const validator = new Validator(this._ruleRegistry, {
      messageFormatter: this._defaultMessageFormatter,
      customMessages,
    })

    // Set the rules
    validator.setRules(rules)

    return validator
  }
}
