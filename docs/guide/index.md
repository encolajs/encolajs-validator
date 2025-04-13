# Introduction

EncolaJS Validator is a powerful and flexible validation library designed for JavaScript applications running in both browser and Node.js environments. It provides a comprehensive solution for validating complex data structures with an excellent developer experience.

## Key Features

- **Rich Rule Set**: Extensive collection of built-in validation rules for various data types
- **Path-based Validation**: Support for deeply nested objects and arrays using dot notation
- **Conditional Validation**: Rules that depend on other field values
- **Extensible**: Easy to add custom validation rules and error messages

## Installation

::: code-group
```shell [npm]
npm i @encolajs/validator
```

```shell [yarn]
yarn add @encolajs/validator
```

```shell [pnpm]
pnpm add @encolajs/validator
```
:::

## Basic Usage

Here's a simple example of how to use EncolaJS Validator:

```javascript
import { createValidator } from '@encolajs/validator'

const validator = createValidator({
  name: 'string',
  age: 'number',
  email: 'email'
})

const data = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}

const isValid = await validator.validate(data)
if (isValid) {
  console.log('Validation passed!')
} else {
  console.log('Validation failed:', validator.getErrors())
}
```