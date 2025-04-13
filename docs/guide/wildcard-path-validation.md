# Array and Wildcard Validation

One of the most powerful features of EncolaJS Validator is its ability to validate arrays and nested data structures using wildcard path notation.

## Wildcard Path Notation

The wildcard symbol `*` in a path allows you to apply validation rules to all elements in an array:

```javascript
const validator = factory.make({
  // Validate all array items
  'users.*.email': 'required|email',
  'users.*.role': 'required|in_list:admin,user',
  
  // Nested arrays
  'departments.*.employees.*.id': 'required|integer',
  
  // Mix of specific and wildcard indices
  'config[0].enabled': 'required|boolean',
  'config.*.settings.timeout': 'required|integer|min:1000'
})
```

## Example Data Structure

This pattern works with complex nested data:

```javascript
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

## Array-Specific Validation Rules

When validating arrays, you may want to check properties of the array itself. For common array validation patterns, see the [Common Validation Patterns](./common-patterns.md#array-validation) guide.

You can also combine wildcard notation with array-specific validation rules:

```javascript
const validator = factory.make({
  // Ensure the array has at least 1 item and at most 10
  'items': 'array_min:1|array_max:10',
  
  // Validate each item in the array
  'items.*.name': 'required|min_length:2',
  'items.*.quantity': 'required|integer|min:1',
  'items.*.price': 'required|number|min:0.01'
})
```

For more complex array validation scenarios, see the [Complex Validation Patterns](./complex-validation-patterns.md) guide.
