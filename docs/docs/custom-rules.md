# Creating a Custom Rule

Custom rules can be created by extending the `ValidationRule` class:

```javascript
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

## Registering Custom Rules

Register the custom rule with the validator factory:

```javascript
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

## Function-Based Custom Rules

For simple cases, you can create rules using just a function:

```javascript
const factory = new ValidatorFactory()

factory.register(
  'https_url',
  (value) => typeof value === 'string' && value.startsWith('https://'),
  'The URL must use HTTPS'
)
```