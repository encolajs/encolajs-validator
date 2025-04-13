# Common Validation Patterns

## Cross-Field Validation

You can reference other fields in validation rules using the `@` symbol:

```javascript
const validator = factory.make({
  'min_value': 'required|number',
  'max_value': 'required|number|gt:@min_value',
  'confirm_email': 'required|same_as:@email',
  'password_confirm': 'required|same_as:@password'
})
```

The value of the referenced field is resolved during validation


## Conditional Required Fields

Make fields required based on other field values:

```javascript
const validator = factory.make({
  'payment_type': 'required|in_list:credit,bank,cash',
  'card_number': 'required_if:payment_type,credit',
  'bank_account': 'required_if:payment_type,bank'
})
```

You can see all the available conditional validation rules on the [buit-in rules page](validation-rules)

## Array Validation

Use wildcard notation to validate all elements in an array:

```javascript
const validator = factory.make({
  // Array length validation
  'items': 'array_min:1|array_max:10',
  
  // Validate each array item
  'items.*.name': 'required|min_length:2',
  'items.*.quantity': 'required|integer|min:1',
  'items.*.price': 'required|number|min:0.01'
})
```

## Nested Objects

Validate deeply nested object structures:

```javascript
const validator = factory.make({
  'user.profile.firstName': 'required|min_length:2',
  'user.profile.lastName': 'required|min_length:2',
  'user.profile.age': 'required|integer|min:18',
  'user.address.street': 'required',
  'user.address.city': 'required',
  'user.address.zipCode': 'required|matches:^\\d{5}$'
})
```

## Custom Error Messages

Provide custom error messages for specific rules:

```javascript
const validator = factory.make(
  {
    'email': 'required|email',
    'password': 'required|min_length:8'
  }, 
  {
    'email:required': 'Email address is required',
    'email:email': 'Please enter a valid email address',
    'password:required': 'Password is required',
    'password:min_length': 'Password must be at least {param:0} characters'
  }
)
```

## Form Submissions

Handle server-side validation errors:

```javascript
// After form submission that returned validation errors
validator.setServerErrors({
  'email': 'This email is already registered',
  'username': 'This username is taken'
})

// Get all errors (client + server)
const errors = validator.getErrors()
```