# Getting Started

The "Installation" page contains a code example that is simple but it does not match most use-cases.
This is because most projects would either have their own validation rules, their own error messages.
For this reason let's start with a step-by-step guide on configuring the EncolaJS Validator for a real project

## Validator Factory

The ValidatorFactory is the main entry point for creating validators. 

- it maintains a registry of validation rules 
- it is the entry point for registering new validation rules
- it provides a consistent way to create validator instances

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

### Validation Rules

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

### Path Notation

The library uses dot notation for accessing nested properties and array indices:

```javascript
const rules = {
  // Simple field
  'name': 'required',
  
  // Nested object
  'address.street': 'required',
  'address.city': 'required',

  // All array elements
  'items.*.price': 'number|min:0',

  // Specific array element
  'phones.0': 'required',
  
  // Nested arrays
  'orders.*.items.*.quantity': 'required|integer|min:1'
}
```

## Basic Validation

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

const dataSource = new PlainObjectDataSource(data)

// Validate all fields
const isValid = await validator.validate(dataSource)

if (!isValid) {
  // Get all validation errors
  const errors = validator.getErrors()
  console.log(errors)
}
```

## Cross-Field Validation

You can reference other fields in validation rules:

```javascript
const validator = factory.make({
  'min_value': 'required|number',
  'max_value': 'required|number|gt:@min_value'
})

const data = {
  min_value: 10,
  max_value: 5  // This will fail validation
}
```

## Conditional Validation

Make fields required based on other field values:

```javascript
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

## Array Validation

```javascript
const validator = factory.make({
  'items.*.name': 'required|min_length:2',
  'items.*.quantity': 'required|integer|min:1',
  'items.*.price': 'required|number|min:0.01'
})

const data = {
  items: [
    { name: 'A', quantity: 1, price: 10.00 },
    { name: 'B', quantity: 0, price: -5 }  // Validation will fail
  ]
}
```

## Complex Conditions

```javascript
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

## Custom Error Messages

```javascript
const validator = factory.make(rules, {
  // Field and rule specific
  'email:required': 'Please enter your email',
  'email:email': 'Please enter a valid email address',
  
  // Rule with parameters should have messages with parameters
  'age:min': 'Must be at least {param:0} years old',
})
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


```javascript
const validator = factory.make({
  name: 'string',
  age: 'number',
  email: 'email'
})

const data = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}

const result = await validator.validate(data)
if (result.isValid) {
  console.log('Validation passed!')
} else {
  console.log('Validation failed:', result.errors)
}
```