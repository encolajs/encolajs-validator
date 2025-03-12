# Advanced Usage

## Table of Contents

- [Custom Rules](#custom-rules)
    - [Creating a Custom Rule](#creating-a-custom-rule)
    - [Registering Custom Rules](#registering-custom-rules)
    - [Function-Based Custom Rules](#function-based-custom-rules)
- [Pattern Matching Validation](#pattern-matching-validation)
    - [Wildcard Path Validation](#wildcard-path-validation)
- [Error Messages](#custom-error-messages)
    - [Dynamic Messages](#dynamic-messages)
    - [Custom Message Formatter](#custom-message-formatter)
    - [Error message-translator](#error-message-translator)
- [Complex Validation Patterns](#complex-validation-patterns)
    - [Conditional Rules Based on Multiple Fields](#conditional-rules-based-on-multiple-fields)
    - [Interdependent Field Validation](#interdependent-field-validation)
    - [Complex Object Validation](#complex-object-validation)
- [Custom Data Sources](#custom-data-sources)

This guide covers advanced validation patterns and features of the @encolajs/validator library.

## Custom Rules

### Creating a Custom Rule

Custom rules can be created by extending the `ValidationRule` class:

```typescript
import { ValidationRule, DataSourceInterface } from '@encolajs/validator'

class DivisibleByRule extends ValidationRule {
  validate(value: any, path: string, datasource: DataSourceInterface): boolean {
    // Skip validation if value is empty
    if (isEmpty(value)) {
      return true
    }

    // Ensure value is a number
    if (!isNumber(value)) {
      return false
    }

    // Get the divisor from parameters
    const divisor = this.parameters?.[0]
    if (!divisor || !isNumber(divisor)) {
      throw new Error('DivisibleByRule requires a numeric divisor parameter')
    }

    return Number(value) % Number(divisor) === 0
  }
}
```

### Registering Custom Rules

Register the custom rule with the validator factory:

```typescript
const factory = new ValidatorFactory()

factory.register(
  'divisible_by',  // rule name
  DivisibleByRule, // rule class
  'The value must be divisible by {param:0}' // error message
)

// Use the custom rule
const validator = factory.make({
  'quantity': 'required|divisible_by:6'
})
```

### Function-Based Custom Rules

For simpler cases, you can create rules using functions:

```typescript
const factory = new ValidatorFactory()

factory.register(
  'https_url',
  (value) => typeof value === 'string' && value.startsWith('https://'),
  'The URL must use HTTPS'
)
```

## Pattern Matching Validation

### Wildcard Path Validation

Use wildcards to validate array items with consistent patterns:

```typescript
const validator = factory.make({
  // Validate all array items
  'users[*].email': 'required|email',
  'users[*].role': 'required|in_list:admin,user',
  
  // Nested arrays
  'departments[*].employees[*].id': 'required|integer',
  
  // Mix of specific and wildcard indices
  'config[0].enabled': 'required|boolean',
  'config[*].settings.timeout': 'required|integer|min:1000'
})

const data = {
  users: [
    { email: 'user1@example.com', role: 'admin' },
    { email: 'user2@example.com', role: 'user' }
  ],
  departments: [
    {
      employees: [
        { id: 1 },
        { id: 2 }
      ]
    }
  ],
  config: [
    { 
      enabled: true,
      settings: { timeout: 2000 }
    },
    {
      enabled: false,
      settings: { timeout: 1500 }
    }
  ]
}
```

## Custom Error Messages

### Dynamic Messages

Error messages can include dynamic values:

```typescript
const validator = factory.make(
  {
    'age': 'required|integer|min:18',
    'username': 'required|min_length:3|max_length:20',
    'email': 'required|email'
  },
  {
    // Use field name
    'username:min_length': '{field} must be at least {param:0} characters',
    
    // Use actual value
    'age:min': 'Age {value} is below minimum {param:0}',
    
    // Reference other fields
    'discount:max': 'Discount cannot exceed {param:0}% of price'
  }
)
```

### Custom Message Formatter

Create a custom message formatter for complete control over error messages:

```typescript
const validator = factory.make(rules, {
  messageFormatter: (ruleName, value, path, validationRule) => {
    // Access validation parameters
    const params = validationRule.parameters || []
    
    // Build custom message
    return `Validation failed for ${path}: ` +
           `value ${value} does not satisfy ${ruleName} ` +
           `with parameters [${params.join(', ')}]`
  }
})
```
### Error Message Translator

Using custom message formatter you can translate the error messages to any language you want.

This is a simple example of how a translation function can be integrated ino the message formatter.

```typescript
// Example usage
import { ValidatorFactory } from '@encolajs/validator'

// Create translations (in real app, this would come from your i18n system)
const translations = {
  'This field is required': 'Este campo es obligatorio',
  'Must be a valid email': 'Debe ser un email válido',
  'Must be at least {min} characters': 'Debe tener al menos {min} caracteres',
  'Must be at least {min}': 'Debe ser al menos {min}'
}

// Create translation service
const translator = function(message: string, params: Record<string, string>) {
  // Get the translation for the message
  const translation = translations[message] ?? message

  // Replace parameters
  return translation.replace(/{(\w+)}/g, (match, key) => params[key] ?? match)
} 

// Create validator with translation
const factory = new ValidatorFactory()

const validator = factory.make({
  'email': 'required|email',
  'password': 'required|min_length:8',
  'age': 'required|min:18'
}, {
  messageFormatter: (ruleName, value, path, rule) => {
    // Get the default message from the rule registry
    const message = factory._ruleRegistry.getDefaultMessage(ruleName) ?? 'Validation failed'

    // Extract parameters for translation
    const params: Record<string, string> = {}

    // Add rule parameters
    rule.parameters?.forEach((param, index) => {
      // If parameter is a field reference, use the path
      const value = param.startsWith('@') ? param.substring(1) : param
      params[`param${index}`] = value

      // Also add semantic names for common parameters
      if (ruleName === 'min_length' || ruleName === 'min') {
        params['min'] = value
      }
    })

    // Translate the message
    return translator(message, params)
  }
})

// Example validation
const data = {
  email: 'invalid',
  password: 'short',
  age: 16
}

await validator.validate(new PlainObjectDataSource(data))
const errors = validator.getErrors()

/* In Spanish:
{
  email: ['Debe ser un email válido'],
  password: ['Debe tener al menos 8 caracteres'],
  age: ['Debe ser al menos 18']
}
*/
```

## Complex Validation Patterns

### Conditional Rules Based on Multiple Fields

```typescript
const validator = factory.make({
  'subscription': 'required|in_list:basic,premium,enterprise',
  'user_count': 'required|integer|min:1',
  'storage_gb': [
    { name: 'required', rule: new RequiredRule() },
    { 
      name: 'min',
      rule: new FunctionBasedRule((value, path, datasource) => {
        const subscription = datasource.getValue('subscription')
        const userCount = datasource.getValue('user_count')
        
        const minStorage = {
          basic: 10,
          premium: 20,
          enterprise: userCount * 10
        }[subscription] || 0
        
        return Number(value) >= minStorage
      })
    }
  ]
})
```

### Interdependent Field Validation

```typescript
const validator = factory.make({
  'discount_type': 'required|in_list:percentage,fixed',
  'discount_value': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'number', rule: new NumberRule() },
    { 
      name: 'max',
      rule: new FunctionBasedRule((value, path, datasource) => {
        const type = datasource.getValue('discount_type')
        const price = datasource.getValue('price')
        
        if (type === 'percentage') {
          return Number(value) <= 100
        } else {
          return Number(value) <= Number(price)
        }
      })
    }
  ]
})
```

### Complex Object Validation

```typescript
const validator = factory.make({
  // Product validation
  'products[*].sku': 'required|matches:^[A-Z]{2}\\d{6}$',
  'products[*].name': 'required|min_length:3',
  'products[*].price': 'required|number|min:0',
  'products[*].categories[*]': 'required|min_length:2',
  
  // Quantity validation based on product type
  'products[*].quantity': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'integer', rule: new IntegerRule() },
    { 
      name: 'min',
      rule: new FunctionBasedRule((value, path, datasource) => {
        // Extract product index from path
        const match = path.match(/products\[(\d+)\]/)
        if (!match) return true
        
        const index = match[1]
        const type = datasource.getValue(`products[${index}].type`)
        
        // Different minimum quantities by type
        const minQuantities = {
          digital: 0,
          physical: 1,
          service: 1
        }
        
        return Number(value) >= (minQuantities[type] || 0)
      })
    }
  ]
})
```

## Custom Data Sources

Create custom data sources for specialized data structures:

```typescript
class CustomModelDataSource implements DataSourceInterface {
  constructor(private model: CustomModel) {}

  getValue(path: string): any {
    return this.model.get(path)
  }

  setValue(path: string, value: any): void {
    this.model.set(path, value)
  }

  hasPath(path: string): boolean {
    return this.model.has(path)
  }

  removePath(path: string): void {
    this.model.remove(path)
  }

  getRawData(): any {
    return this.model.toJSON()
  }

  clone(): DataSourceInterface {
    return new CustomModelDataSource(this.model.clone())
  }
}
```

For form-specific validation features like progressive validation, temporary values, and server-side errors, please refer to the [Form Validation](./form-validation.md) guide.