# @encolajs/validator

A powerful, flexible validation library designed for complex form validation scenarios. Built with TypeScript, it provides robust validation capabilities while maintaining excellent developer experience.

## Features

- **Progressive Validation**: Handle validation gracefully as users type, supporting temporary invalid states
- **Flexible Data Sources**: Works with plain objects, custom model classes, and more
- **Rich Rule Set**: Extensive collection of built-in validation rules
- **Framework Agnostic**: Core validation logic independent of UI frameworks
- **TypeScript Support**: Full type definitions included
- **Modular Design**: Use only what you need
- **Extensible**: Easy to add custom validation rules
- **Path-based Validation**: Support for nested objects and arrays

## Installation

```bash
# Using npm
npm install @encolajs/validator

# Using yarn
yarn add @encolajs/validator

# Using pnpm
pnpm add @encolajs/validator
```

## Quick Start

Here's a simple example that demonstrates basic validation:

```typescript
import { ValidatorFactory } from '@encolajs/validator'

// Create a validator factory
const factory = new ValidatorFactory()

// Define validation rules
const rules = {
  'email': 'required|email',
  'password': 'required|password:8,32',
  'profile.name': 'required|min_length:2'
}

// Create a validator instance
const validator = factory.make(rules)

// Validate some data
const data = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  profile: {
    name: 'John'
  }
}

// Validate all fields
await validator.validate(data)

// Check for errors
if (validator.hasErrors()) {
  console.log(validator.getErrors())
}
```

## Working with Form Input

Here's how to handle progressive validation with temporary values:

```typescript
import { ValidatorFactory, TentativeValuesDataSource } from '@encolajs/validator'

// Create validator with rules
const validator = new ValidatorFactory().make({
  'email': 'required|email',
  'password': 'required|password:8,32'
})

// Initial data object
const data = {
  email: '',
  password: ''
}

// Create a data source that can handle temporary values
const dataSource = new TentativeValuesDataSource(data, {})

// Example: Validate a single field as it changes
function validateField(field: string, value: string) {
  // Update temporary value
  dataSource.setValue(field, value)
  
  // Validate just this field
  validator.validatePath(field, dataSource)
  
  // Get errors for this field
  return validator.getErrorsForPath(field)
}

// Example: Handle form submission
async function validateForm() {
  // Validate all fields
  const isValid = await validator.validate(dataSource)
  
  if (isValid) {
    // Commit all temporary values to the actual data
    dataSource.commitAll()
    return true
  }
  
  // Get all validation errors
  return validator.getErrors()
}
```

## Key Concepts

### Path-based Validation

The library uses dot notation to reference nested fields:

```typescript
const rules = {
  'user.name': 'required|min_length:2',
  'user.email': 'required|email',
  'addresses[0].street': 'required',
  'items[*].quantity': 'required|number|min:1'
}
```

### Conditional Validation

Rules can reference other fields:

```typescript
const rules = {
  'shipping_address': 'required_unless:pickup,true',
  'card_number': 'required_if:payment_type,credit'
}
```

### Custom Error Messages

Customize error messages for better user experience:

```typescript
const validator = factory.make(rules, {
  'email:required': 'Please enter your email address',
  'password:min_length': 'Password must be at least {param:0} characters'
})
```

## Documentation

- [Guide](./guide.md) - Core concepts and usage patterns
- [Validation Rules](./validation-rules.md) - Complete list of built-in validation rules
- [Advanced Usage](./advanced-usage.md) - Advanced patterns and features
- [Form validation](./form-validation.md) - Using the library in the context of forms