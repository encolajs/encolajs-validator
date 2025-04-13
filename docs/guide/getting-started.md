# Getting Started

This guide expands on the introduction, demonstrating how to configure EncolaJS Validator for real-world projects that require custom rules and error messages.

## Validator Factory

The ValidatorFactory is the main entry point for creating validators:

- It maintains a registry of validation rules 
- It serves as the entry point for registering new validation rules
- It provides a consistent way to create validator instances

```javascript
import { ValidatorFactory } from '@encolajs/validator'

// Create a factory instance
const factory = new ValidatorFactory()

// Create a validator with rules
const validator = factory.make({
  'username': 'required|alpha_numeric',
  'email': 'required|email'
})
```

## Defining Validation Rules

Rules can be specified in two formats:

1. **String Format** (recommended for most cases):
```javascript
const rules = {
  'email': 'required|email',
  'age': 'required|number|min:18'
}
```

2. **Object Format** (provides more control):
```javascript
import { RequiredRule, EmailRule } from '@encolajs/validator'

const rules = {
  'email': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'email', rule: new EmailRule() }
  ]
}
```

## Path Notation

The library uses dot notation for accessing nested properties and array indices:

```javascript
const rules = {
  // Simple field
  'name': 'required',
  
  // Nested object
  'address.street': 'required',
  'address.city': 'required',

  // Specific array element
  'phones.0': 'required'
}
```

For more advanced path patterns including wildcards and nested arrays, see the [Wildcard Path Validation](./wildcard-path-validation.md) guide.

## Performing Validation

```javascript
const validator = factory.make({
  'name': 'required|min_length:2',
  'email': 'required|email',
  'age': 'required|integer|min:18'
})

const data = {
  name: 'John',
  email: 'john@example.com',
  age: 25
}

// Validate all fields
const isValid = await validator.validate(data)

if (!isValid) {
  // Get all validation errors
  const errors = validator.getErrors()
  console.log(errors)
}
```

## Error Handling

The validator provides several methods to access validation errors:

```javascript
// Get all errors
const allErrors = validator.getErrors()
// Returns: { fieldName: string[] }

// Get errors for specific field
const emailErrors = validator.getErrorsForPath('email')
// Returns: string[]

// Check if any errors exist
const hasErrors = validator.hasErrors()
// Returns: boolean

// Check if specific field has errors
const hasEmailErrors = validator.hasErrorsForPath('email')
// Returns: boolean
```

## Next Steps

After understanding the basics, explore these topics for more advanced validation capabilities:

- [Common Validation Patterns](./common-patterns.md): Frequently used validation patterns
- [Built-in Validation Rules](./validation-rules.md): Complete list of built-in validation rules
- [Custom Validation rulesRules](./custom-rules.md): Create your own validation rules
- [Form Validation](./form-validation.md): Special considerations for validating forms
- [Custom Error Messages](./custom-errors.md): Customize error messages and format
- [Complex Validation Patterns](./complex-validation-patterns.md): Interdependent field validation
