# Form Validation

Form validation has unique requirements compared to simple data validation where you validate an object in one go:
1. Server-side validation errors need to be handled
2. Some fields depend on other fields and the valid/invalid status need to be updated as soon as possible

## Server-side Validation

For basic examples of handling server-side validation errors, see the [Common Validation Patterns](./common-patterns.md#form-submissions) guide.

Here's a complete example of handling validation errors returned from the server:

```javascript
// Set server validation errors
validator.setServerErrors({
  'email': 'This email is already registered',
  'username': 'This username is taken'
})

// Remove server error for a specific field
validator.removeServerError('email')

// Clear all server errors
validator.clearServerErrors()

// Get combined client and server errors
const errors = validator.getErrors()
```

## Field Dependencies

When fields depend on each other, you have to revalidate dependent fields when a field changes:

```javascript
const validator = factory.make({
  'password': 'required|password:8,32',
  'confirm_password': 'required|same_as:@password'
})

async function handleFieldChange(field: string, value: string) {
  // Update the field value
  dataSource.setValue(field, value)
  
  // Get dependent fields
  const dependentFields = validator.getDependentFields(field)
  
  // Validate this field and all dependent fields
  const fieldsToValidate = [field, ...dependentFields]
  
  for (const fieldToValidate of fieldsToValidate) {
    await validator.validatePath(fieldToValidate, dataSource)
  }
}
```