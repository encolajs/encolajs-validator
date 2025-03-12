# Guide

This guide covers the core concepts and patterns for using the @encolajs/validator library.

## Core Concepts

### Validator Factory

The ValidatorFactory is the main entry point for creating validators. It maintains a registry of validation rules and provides a consistent way to create validator instances.

```typescript
import { ValidatorFactory } from '@encolajs/validator'

// Create a factory instance
const factory = new ValidatorFactory()

// Create a validator with rules
const validator = factory.make({
  'username': 'required|alpha_numeric',
  'email': 'required|email'
})
```

### Validation Rules

Rules can be specified in two formats:

1. String Format (recommended for simple cases):
```typescript
const rules = {
  'email': 'required|email',
  'age': 'required|number|min:18'
}
```

2. Object Format (provides more control):
```typescript
import { RequiredRule, EmailRule } from '@encolajs/validator'

const rules = {
  'email': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'email', rule: new EmailRule() }
  ]
}
```

### Path Notation

The library uses dot notation for accessing nested properties and array indices:

```typescript
const rules = {
  // Simple field
  'name': 'required',
  
  // Nested object
  'address.street': 'required',
  'address.city': 'required',
  
  // Array elements
  'phones[0]': 'required',
  
  // All array elements
  'items[*].price': 'number|min:0',
  
  // Nested arrays
  'orders[*].items[*].quantity': 'required|integer|min:1'
}
```

### Data Sources

The PlainObjectDataSource provides a uniform interface for accessing data in plain JavaScript objects:

```typescript
import { PlainObjectDataSource } from '@encolajs/validator'

const data = {
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'Boston'
  },
  phones: ['555-0123', '555-0124'],
  orders: [
    { 
      id: 1,
      items: [
        { product: 'A', quantity: 2 },
        { product: 'B', quantity: 1 }
      ]
    }
  ]
}

const dataSource = new PlainObjectDataSource(data)
```

## Validation Patterns

### Basic Validation

```typescript
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

const dataSource = new PlainObjectDataSource(data)

// Validate all fields
const isValid = await validator.validate(dataSource)

if (!isValid) {
  // Get all validation errors
  const errors = validator.getErrors()
  console.log(errors)
}
```

### Cross-Field Validation

Reference other fields in validation rules:

```typescript
const validator = factory.make({
  'min_value': 'required|number',
  'max_value': 'required|number|gt:@min_value'
})

const data = {
  min_value: 10,
  max_value: 5  // This will fail validation
}
```

### Conditional Validation

Make fields required based on other field values:

```typescript
const validator = factory.make({
  'payment_type': 'required|in_list:credit,bank,cash',
  'card_number': 'required_if:payment_type,credit',
  'bank_account': 'required_if:payment_type,bank'
})

const data = {
  payment_type: 'credit',
  // card_number missing - will fail validation
  bank_account: '1234-5678' // not required since payment_type is credit
}
```

### Custom Error Messages

```typescript
const validator = factory.make(rules, {
  // Field and rule specific
  'email:required': 'Please enter your email',
  'email:email': 'Please enter a valid email address',
  
  // Using parameters
  'age:min': 'Must be at least {param:0} years old',
  
  // Reference the field name
  'items[*].price:min': '{field} must be at least {param:0}'
})
```

### Array Validation

```typescript
const validator = factory.make({
  'items[*].name': 'required|min_length:2',
  'items[*].quantity': 'required|integer|min:1',
  'items[*].price': 'required|number|min:0.01'
})

const data = {
  items: [
    { name: 'A', quantity: 1, price: 10.00 },
    { name: 'B', quantity: 0, price: -5 }  // Will fail validation
  ]
}
```

### Complex Conditions

```typescript
const validator = factory.make({
  'subscription': 'required|in_list:basic,premium',
  'storage_gb': 'required|integer|min:5',
  'max_users': 'required_if:subscription,premium|integer|min:5'
})

const data = {
  subscription: 'premium',
  storage_gb: 100,
  // max_users missing - will fail validation because subscription is premium
}
```

## Error Handling

The validator provides several methods to access validation errors:

```typescript
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

For form validation specific features like progressive validation, temporary values, and server-side errors, please refer to the [Form Validation](./form-validation.md) guide.