# Custom Data Sources

Most of the times you are going to validate plain JS objects but there might be situations you many validate objects that have special behaviour. For example validating a model that has a `get` methods to retrieve the values.

```javascript
class SpecialObject {
  private _data: Record<string, any> = {}

  get(path: string): any {
    return this._data[path]
  }
}

const person = new SpecialObject({
  name: 'John',
  age: 30
})
```

EncolaJS Validation library is path-based so the validator would have to know how to get the value for the `name` path or the `age` path. 

By default the EncolaJS Validation library comes with a method that works with plain objects so, most of the times, you don't need to do anything. As long as you can do `person.friends[0].name` on the object and it returns the proper value, 
you're fine.

But if you want to validate a special object, you need to configure the `value getter function` for the validator.

In the example above, the value getter function would look like this:

```javascript
const valueGetter = (value: string, data: object) => {
  return data.get(value)
}
```

Using such a function in your application can be done at 2 levels:

1. **The validator factory level**: This is the default value getter function that will be used for all validators. You can set this function when creating the validator factory.

```javascript
const factory = new ValidatorFactory(messageFormatterFunction, valueGetter)
```

This will push the value getter function to all validators created by the factory.

2. **The validator level**: You can also set the value getter function for a specific validator. This will override the value getter function set at the factory level.

This could be useful if you want to use a different value getter function for a specific validator.

```javascript
const validator = factory.make(rules, customMessages, valueGetter)
```
or
```javascript
const validator = factory.make(rules)
validator.setValueGetter(valueGetter)
```

**!Important**: The value getter function must work with deeply nested objects. This means that if inside a special object you have a plain object, the value getter function must be able to retrieve the value from the plain object as well.

The value getter function is called with the path to the value. The path is a string that can contain dots and brackets. For example: `user.name` or `user.address[0].street`.