# Form Validation

Form validation has unique requirements compared to simple data validation where you validate an object in one go:
1. server-side validation errors need to be handled
2. some fields depend on other fields and the valid/invalid status need to be updated as soon as possible

## 1. Server-side Validation

Handle validation errors returned from the server:

```typescript
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

## 2. Field Dependencies

When fields depend on each other, revalidate dependent fields when a field changes:

```typescript
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

## Common Patterns

Here are some example of how you might go about implementing cha

### Field Change Handling

```typescript
function handleFieldChange(field: string, value: string) {
  // Store value
  dataSource[field] = value
  
  // Validate the field
  await validator.validatePath(field, dataSource)
  
  // Clear any server errors for this field
  validator.removeServerError(field)
  
  // Get validation errors
  const errors = validator.getErrorsForPath(field)
}
```

### Form Submission

```typescript
async function handleSubmit() {
  // Validate all fields
  const isValid = await validator.validate(dataSource)
  
  if (isValid) {
    try {
      // Submit form data
      await submitForm(dataSource)
      
    } catch (error) {
      // Handle server validation errors
      if (error.validationErrors) {
        validator.setServerErrors(error.validationErrors)
      }
    }
  }
  
  // Get all validation errors (client + server)
  const errors = validator.getErrors()
}
```
