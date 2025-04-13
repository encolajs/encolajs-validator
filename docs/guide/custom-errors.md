# Custom Error Messages

The EncolaJS Validation library lets you customize the error messages on multiple levels.

## Custom error messages per validator

For basic examples of custom error messages, see the [Common Validation Patterns](./common-patterns.md#custom-error-messages) guide.

Error messages can include dynamic values:

```javascript
const validator = factory.make(
  {
    'age': 'required|integer|min:18',
    'username': 'required|min_length:3|max_length:20',
    'email': 'required|email'
  },
  // below is the list of custom error message specific to this validator
  // the format is {{path}}:{{rule_name}}
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

## Custom Message Formatter

While the library comes with a built-in list of messages sometimes you may not want to use them. For example the `start_with` validation rule comes with this message `This field must start with "{param:0}"` which would generate an error message 
like `This field must start with "beginning"`

To change the default behaviour you have to implement a custom message formatter.

```javascript
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

## Translating error messages

Using custom message formatter you can translate the error messages to any language you want.

This is a simple example of how a translation function can be integrated ino the message formatter.

```javascript
// Example usage
import { ValidatorFactory } from '@encolajs/validator'

// Create translations (in real app, this would come from your i18n system)
const translations = {
  'This field is required': 'Este campo es obligatorio',
  'Must be a valid email': 'Debe ser un email válido',
  'Must be at least {param:0} characters': 'Debe tener al menos {param:0} caracteres',
  'Must be at least {param:0}': 'Debe ser al menos {param:0}'
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

    // Translate the message
    return translator(message, rule.params)
  }
})

// Example validation
const data = {
  email: 'invalid',
  password: 'short',
  age: 16
}

await validator.validate(data)
const errors = validator.getErrors()

/* In Spanish:
{
  email: ['Debe ser un email válido'],
  password: ['Debe tener al menos 8 caracteres'],
  age: ['Debe ser al menos 18']
}
*/
```

