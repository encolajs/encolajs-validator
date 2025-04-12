# Complex Validation Patterns

## Interdependent Field Validation

In this scenario we're checking if a discount value is less than 100%, if the discount type is percentage, or if it's less than the price of the product, if the discount type is fixed.

As you can see the validation rules are sent to the validator factory as a list of rules instead of a string that is being parsed by the factory.

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

## Complex Object Validation

This is a similar example as above but this time we're using wildcards for the rules.

The validation ensures that the maximum quantity for the products in an order differs based on the t

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
        
        // Different minimum quantities by type
        const maxQuantities = {
          digital: 5,
          physical: 10,
          service: 1
        }
        
        return Number(value) >= (maxQuantities[type] || 0)
      })
    }
  ]
})
```