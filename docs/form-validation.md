# Form Validation

## Table of Contents

- [Overview](#overview)
- [Progressive Validation](#progressive-validation)
    - [Temporary Values](#temporary-values)
    - [Single Field Validation](#single-field-validation)
- [Server-side Validation](#server-side-validation)
- [Common Patterns](#common-patterns)
    - [Field Change Handling](#field-change-handling)
    - [Form Submission](#form-submission)
    - [Field Dependencies](#field-dependencies)
- [Best Practices](#best-practices)

## Overview

Form validation has unique requirements compared to simple data validation:
- Users enter data progressively
- Fields may be temporarily invalid
- Server-side validation errors need to be handled
- Changes need to be validated before submission

This guide covers the specialized features provided by the validator library for handling these form-specific scenarios.

## Progressive Validation

### Data Sources and Temporary Values

The validator library uses data sources to abstract how data is accessed and modified. This abstraction is particularly important for form validation where we need to handle temporarily invalid data states.

#### PlainObjectDataSource

The `PlainObjectDataSource` provides a basic implementation for working with plain JavaScript objects:

```typescript
import { PlainObjectDataSource } from '@encolajs/validator'

const data = {
  user: {
    email: 'john@example.com',
    settings: {
      notifications: true
    }
  }
}

const dataSource = new PlainObjectDataSource(data)

// Access nested data using dot notation
const email = dataSource.getValue('user.email')
dataSource.setValue('user.settings.notifications', false)
```

#### TentativeValuesDataSource

The `TentativeValuesDataSource` is designed specifically for form validation scenarios where:

1. Users may input temporarily invalid data during form filling
    - Example: A user typing an email address "john@example" - it's invalid but incomplete
    - We need to store this value for validation but can't commit it to the underlying data model

2. The underlying data model may be strongly typed or have validation
    - Example: A typed model class that only accepts valid email addresses
    - Attempting to set invalid values would throw errors
    - We need a place to store invalid values during the editing process

```typescript
import { ValidatorFactory, TentativeValuesDataSource } from '@encolajs/validator'

// This could be a plain object or a strongly typed model
const userModel = new UserModel({
  email: 'john@example.com',
  age: 25
})

// Create a data source that can handle temporary values
const dataSource = new TentativeValuesDataSource(userModel, {})

// User starts typing an email - it's temporarily invalid
dataSource.setValue('email', 'john@exa')

// The temporary value is stored separately
console.log(dataSource.getValue('email')) // 'john@exa'
console.log(userModel.email) // still 'john@example.com'

// Once the value is valid, we can commit it
if (await validator.validatePath('email', dataSource)) {
  dataSource.commit('email')
}

// Get all pending changes
const tempValues = dataSource.getTentativeValues()
```

This approach allows us to:
- Store and validate incomplete/invalid data during form editing
- Prevent invalid values from corrupting the underlying data model
- Commit values only when they pass validation
- Support strongly typed data models without compromising type safety

### Single Field Validation

Validate individual fields as they change:

```typescript
const validator = factory.make({
  'email': 'required|email',
  'password': 'required|password:8,32'
})

// Validate a single field
await validator.validatePath('email', dataSource)

// Get errors for just this field
const errors = validator.getErrorsForPath('email')
```

## Server-side Validation

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

## Common Patterns

### Field Change Handling

```typescript
function handleFieldChange(field: string, value: string) {
  // Store temporary value
  dataSource.setValue(field, value)
  
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
      await submitForm(dataSource.getRawData())
      
      // On success, commit all temporary values
      dataSource.commitAll()
      
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

### Field Dependencies

When fields depend on each other, revalidate dependent fields when a field changes:

```typescript
const validator = factory.make({
  'password': 'required|password:8,32',
  'confirm_password': 'required|same_as:@password'
})

function handleFieldChange(field: string, value: string) {
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

## Best Practices

1. **Use Temporary Values**
    - Always use TentativeValuesDataSource for forms
    - Only commit values after successful validation
    - Keep original data intact until form submission

2. **Progressive Validation**
    - Validate fields as they change
    - Use validatePath() for individual field validation
    - Clear server errors when field changes

3. **Handle Dependencies**
    - Identify fields that depend on each other
    - Revalidate dependent fields when values change
    - Use getDependentFields() to track dependencies

4. **Server Validation**
    - Set server errors separately from client validation
    - Clear server errors when field changes
    - Combine client and server errors in UI

5. **Efficient Validation**
    - Only validate what's necessary
    - Validate single fields during user input
    - Validate all fields on form submission

6. **Error Management**
    - Keep error messages user-friendly
    - Show errors at appropriate times
    - Clear errors when they're no longer relevant

These form-specific features complement the core validation capabilities covered in the main documentation, providing everything needed for handling complex form validation scenarios.