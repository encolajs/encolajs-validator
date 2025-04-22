# Validation Rules

This document provides a comprehensive list of all built-in validation rules. Each rule includes a description, parameters (if any), and examples of usage.

- [Required Rules](#required-rules): required, required_with, required_without, required_when, required_unless
- [Number Rules](#number-rules): number, integer, gt, gte, lt, lte
- [String Rules](#string-rules): email, url, alpha, alpha_numeric, matches, min_length, max_length, contains, starts_with, slug, password
- [Array Rules](#array-rules): array_min_length, array_max_length
- [Date Rules](#date-rules): date_format, date_after, date_before, date_between, age
- [Special Rules](#special-rules): in_list, same_as

## Cross-Field Validation

Many rules support referencing other fields using the @ symbol. This allows for dynamic validation based on other field values. For common examples, see the [Common Validation Patterns](./common-patterns.md#cross-field-validation) guide.

Here's a quick example:

```javascript
const rules = {
  'min_price': 'required|number',
  'max_price': 'required|number|gt:@min_price',
  'confirm_email': 'required|same_as:@email',
  'checkout_date': 'required|date_after:@checkin_date'
}
```

## Required Rules

### required
Validates that the field is present and not empty.

```javascript
const rules = {
  'name': 'required'
}
```

### required_with
Field is required when another specified field has a value.

Parameters:
- `field`: Reference to another field (using @)

```javascript
const rules = {
  'shipping_address': 'required_with:@shipping_enabled'
}
```

### required_without
Field is required when another specified field is empty.

Parameters:
- `field`: Reference to another field (using @)

```javascript
const rules = {
  'phone': 'required_without:@email'
}
```

### required_when
Field is required when another field equals a specific value.

Parameters:
- `field`: Reference to another field (using @)
- `value`: The comparison value

```javascript
const rules = {
  'company_name': 'required_when:type,business'
}
```

### required_unless
Field is required unless another field equals a specific value.

Parameters:
- `field`: Reference to another field (using @)
- `value`: The comparison value

```javascript
const rules = {
  'guardian': 'required_unless:age,18'
}
```

## Number Rules

### number
Validates that the value is a valid number.

```javascript
const rules = {
  'price': 'number'
}
```

### integer
Validates that the value is a valid integer.

```javascript
const rules = {
  'quantity': 'integer'
}
```

### gt (Greater Than)
Validates that the number is greater than the specified value.

Parameters:
- `value`: Number or field reference (using @)

```javascript
const rules = {
  'max_value': 'number|gt:@min_value',
  'age': 'number|gt:0'
}
```

### gte (Greater Than or Equal)
Validates that the number is greater than or equal to the specified value.

Parameters:
- `value`: Number or field reference (using @)

```javascript
const rules = {
  'quantity': 'number|gte:1'
}
```

### lt (Less Than)
Validates that the number is less than the specified value.

Parameters:
- `value`: Number or field reference (using @)

```javascript
const rules = {
  'discount': 'number|lt:100'
}
```

### lte (Less Than or Equal)
Validates that the number is less than or equal to the specified value.

Parameters:
- `value`: Number or field reference (using @)

```javascript
const rules = {
  'progress': 'number|lte:100'
}
```

## String Rules

### email
Validates that the value is a valid email address.

```javascript
const rules = {
  'email': 'email'
}
```

### url
Validates that the value is a valid URL.

```javascript
const rules = {
  'website': 'url'
}
```

### alpha
Validates that the value contains only alphabetic characters.

```javascript
const rules = {
  'name': 'alpha'
}
```

### alpha_numeric
Validates that the value contains only alphanumeric characters.

```javascript
const rules = {
  'username': 'alpha_numeric'
}
```

### matches
Validates that the value matches a regular expression pattern.

Parameters:
- `pattern`: Regular expression pattern

```javascript
const rules = {
  'code': 'matches:^[A-Z]{2}\\d{4}$'
}
```

### min_length
Validates minimum string length.

Parameters:
- `length`: Minimum length required

```javascript
const rules = {
  'password': 'min_length:8'
}
```

### max_length
Validates maximum string length.

Parameters:
- `length`: Maximum length allowed

```javascript
const rules = {
  'title': 'max_length:100'
}
```

### contains
Validates that the string contains a specific substring.

Parameters:
- `substring`: The substring to search for

```javascript
const rules = {
  'domain': 'contains:example.com'
}
```

### starts_with
Validates that the string starts with a specific substring.

Parameters:
- `substring`: The substring to check

```javascript
const rules = {
  'product_code': 'starts_with:PRD-'
}
```

### slug
Validates that the value is a valid URL slug (letters, numbers, dashes, underscores).

```javascript
const rules = {
  'post_slug': 'slug'
}
```

### password
Validates that the value meets password requirements.

Parameters:
- `min_length`: Minimum length (default: 8)
- `max_length`: Maximum length (default: 32)

Password must contain:
- At least one uppercase letter
- At least one number
- At least one special character

```javascript
const rules = {
  'password': 'password:8,32'
}
```

## Array Rules

### array_min
Validates minimum array length.

Parameters:
- `length`: Minimum number of items required

```javascript
const rules = {
  'tags': 'array_min:1'
}
```

### array_max
Validates maximum array length.

Parameters:
- `length`: Maximum number of items allowed

```javascript
const rules = {
  'selections': 'array_max:5'
}
```

## Date Rules

### date_format
Validates that the value is a valid date in the specified format. Accepts both string dates and Date objects.

Parameters:
- `format`: Date format. Supports both JS-style (yy) and legacy (YYYY) formats:
  - JS-style formats (default: 'yy-mm-dd'):
    - 'yy-mm-dd'
    - 'mm/dd/yy'
    - 'dd/mm/yy'
    - 'yy/mm/dd'
    - 'mm-dd-yy'
    - 'dd-mm-yy'
  - Legacy formats:
    - 'YYYY-MM-DD'
    - 'MM/DD/YYYY'
    - 'DD/MM/YYYY'
    - 'YYYY/MM/DD'
    - 'MM-DD-YYYY'
    - 'DD-MM-YYYY'

The rule performs strict date validation, ensuring:
- Valid month (1-12)
- Valid day for the given month (e.g., 30 days for April)
- Proper leap year handling for February

```javascript
const rules = {
  // Using JS-style format (default)
  'birth_date': 'date_format:yy-mm-dd',
  
  // Using legacy format
  'start_date': 'date_format:YYYY-MM-DD',
  
  // Using other formats
  'expiry_date': 'date_format:mm/yy',
  'event_date': 'date_format:DD/MM/YYYY'
}

// Also works with Date objects
const data = {
  birth_date: new Date('2024-01-01'),
  start_date: '2024-01-01'
}
```

### date_after
Validates that the date is after the specified date. Accepts both string dates and Date objects.

Parameters:
- `date`: Date string, Date object, or field reference (using @)
- `format`: (Optional) Date format for parsing string dates (defaults to 'yyyy-mm-dd')

> [!INFORMATION] the `date` parameter can be provided in the format of the last parameter or in the `yyyy-mm-dd` format

```javascript
const rules = {
  'end_date': 'date_after:@start_date',
  'event_date': 'date_after:2024-01-01,yyyy-mm-dd',
  'future_date': 'date_after:now'
}

// Also works with Date objects
const data = {
  end_date: new Date('2024-12-31'),
  start_date: new Date('2024-01-01')
}
```

### date_before
Validates that the date is before the specified date. Accepts both string dates and Date objects.

Parameters:
- `date`: Date string, Date object, or field reference (using @)
- `format`: (Optional) Date format for parsing string dates (defaults to 'yyyy-mm-dd')

> [!INFORMATION] the `date` parameter can be provided in the format of the last parameter or in the `yyyy-mm-dd` format

```javascript
const rules = {
  'start_date': 'date_before:@end_date',
  'event_date': 'date_before:2024-12-31,yyyy-mm-dd',
  'past_date': 'date_before:now'
}

// Also works with Date objects
const data = {
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-12-31')
}
```

### date_between
Validates that the date falls between two dates. Accepts both string dates and Date objects.

Parameters:
- `start`: Start date string, Date object, or field reference (using @)
- `end`: End date string, Date object, or field reference (using @)
- `format`: (Optional) Date format for parsing string dates (defaults to 'yyyy-mm-dd')

> [!INFORMATION] the `start` and `end` can be provided in the format of the last parameter or in the `yyyy-mm-dd` format

```javascript
const rules = {
  'event_date': 'date_between:2024-01-01,2024-12-31,yyyy-mm-dd',
  'booking_date': 'date_between:@checkin_date,@checkout_date'
}

// Also works with Date objects
const data = {
  event_date: new Date('2024-06-15'),
  checkin_date: new Date('2024-06-01'),
  checkout_date: new Date('2024-06-30')
}
```

### age
Validates minimum age based on date of birth.

Parameters:
- `years`: Minimum age in years

```javascript
const rules = {
  'birth_date': 'age:18'
}
```

## Special Rules

### same_as
Validates that the value matches another field's value.

Parameters:
- `field`: Reference to another field (using @)

```javascript
const rules = {
  'password': 'required|password',
  'confirm_password': 'required|same_as:@password'
}
```

### in_list
Validates that the value is in a list of allowed values.

Parameters:
- `values`: Comma-separated list of allowed values

```javascript
const rules = {
  'status': 'in_list:pending,approved,rejected',
  'type': 'in_list:user,admin'
}
```

## More Advanced Validation Patterns

For more complex validation scenarios like:
- Validating interdependent fields
- Custom validation functions
- Complex object validation

See the [Complex Validation Patterns](./complex-validation-patterns.md) guide.