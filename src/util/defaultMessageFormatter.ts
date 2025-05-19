import { ValidationRule } from '../ValidationRule'

export function getCustomMessage(
  customMessages: Record<string, string>,
  path: string,
  ruleName: string
): string | undefined {
  const customMessageKey = `${path}:${ruleName}`
  const message = customMessages[customMessageKey]
  if (message) {
    return message
  }

  const convertedPathKey =
    path
      .split('.')
      .map((p) => (/^\d+$/.test(p) ? '*' : p))
      .join('.') +
    ':' +
    ruleName

  if (customMessages[convertedPathKey]) {
    return customMessages[convertedPathKey]
  }

  return undefined
}

export default function (
  ruleName: string,
  value: any,
  path: string,
  validationRule: ValidationRule
): string {
  // Get default message from rule registry
  const defaultMessage: string =
    this._ruleRegistry.getDefaultMessage(ruleName) || 'Validation failed'

  let message = getCustomMessage(this._customMessages, path, ruleName)

  message = message || defaultMessage

  // Replace {value}
  message = message.replace(
    /{value}/g,
    String(value === undefined ? 'undefined' : value)
  )

  // Replace {param:name} with parameters from rule
  message = message.replace(
    /{param:(\d+)}/g,
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
