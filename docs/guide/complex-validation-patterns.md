# Complex Validation Patterns

This guide covers advanced validation scenarios that go beyond simple field validation.

## Conditional Validation

For basic conditional validation patterns, like making fields required based on other field values, see the [Common Validation Patterns](./common-patterns.md#conditional-required-fields) guide.

Here's an example of more complex conditions:

```javascript
const validator = factory.make({
  'subscription': 'required|in_list:basic,premium',
  'storage_gb': 'required|integer|min:5',
  'max_users': 'required_if:subscription,premium|integer|min:5'
})
```

## Interdependent Field Validation

When the validation rule for one field depends on the value of another field, you can use custom validation functions:

```javascript
const validator = factory.make({
  'discount_type': 'required|in_list:percentage,fixed',
  'discount_value': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'number', rule: new NumberRule() },
    { 
      name: 'max',
      rule: new FunctionBasedRule((value, path, datasource) => {
        const type = datasource.discount_type
        const price = datasource.price
        
        if (type === 'percentage') {
          return Number(value) <= 100
        } else {
          return Number(value) <= Number(price)
        }
      })
    }
  ]
})
```

## Dynamic Array Validation

This example shows how to validate array items with rules that depend on properties of each item:

```javascript
const validator = factory.make({
  // Product validation
  'products.*.sku': 'required|matches:^[A-Z]{2}\\d{6}$',
  'products.*.name': 'required|min_length:3',
  'products.*.type': 'required|in_list:digital,physical,service',
  'products.*.price': 'required|number|min:0',
  'products.*.categories.*.': 'required|min_length:2',
  
  // Quantity validation based on product type
  'products.*.quantity': [
    { name: 'required', rule: new RequiredRule() },
    { name: 'integer', rule: new IntegerRule() },
    { 
      name: 'max',
      rule: new FunctionBasedRule((value, path, datasource) => {
        // Extract product index from path
        const match = path.match(/products\[(\d+)\]/)
        if (!match) return true
        
        const index = match[1]
        const type = datasource.products[index].type
        
        // Different maximum quantities by type
        const maxQuantities = {
          digital: 5,
          physical: 10,
          service: 1
        }
        
        return Number(value) <= (maxQuantities[type] || 999)
      })
    }
  ]
})
```

## Related Topics

- For more information on creating custom validation functions, see [Custom Rules](./custom-rules.md)
- For validation of form inputs, see [Form Validation](./form-validation.md)
- For validation with wildcards and arrays, see [Array and Wildcard Validation](./wildcard-path-validation.md)